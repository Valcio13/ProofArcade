package rpc

import (
	"encoding/hex"
	"encoding/json"
	"net/http"
	"os"
	"strings"

	"github.com/canopy-network/canopy/lib/crypto"
	"github.com/julienschmidt/httprouter"
)

// AdminAuthConfig holds admin authentication configuration
type AdminAuthConfig struct {
	Enabled        bool     `json:"enabled"`
	AdminAddresses []string `json:"admin_addresses"`
}

// LoadAdminConfig loads admin configuration from environment or file
func LoadAdminConfig(dataDir string) *AdminAuthConfig {
	config := &AdminAuthConfig{
		Enabled:        false,
		AdminAddresses: []string{},
	}

	// Check environment variable for admin addresses
	envAddresses := os.Getenv("CANOPY_ADMIN_ADDRESSES")
	if envAddresses != "" {
		config.Enabled = true
		config.AdminAddresses = strings.Split(envAddresses, ",")
		// Trim whitespace
		for i := range config.AdminAddresses {
			config.AdminAddresses[i] = strings.TrimSpace(config.AdminAddresses[i])
		}
		return config
	}

	// Try to load from config file in data directory
	configPath := dataDir + "/admin_config.json"
	data, err := os.ReadFile(configPath)
	if err != nil {
		// No config file, admin auth disabled
		return config
	}

	if err := json.Unmarshal(data, config); err != nil {
		// Invalid config, admin auth disabled
		return config
	}

	return config
}

// IsAdminAddress checks if an address is in the admin whitelist
func (s *Server) IsAdminAddress(address string) bool {
	if s.adminConfig == nil || !s.adminConfig.Enabled {
		return false
	}

	// Normalize address to lowercase for comparison
	normalizedAddr := strings.ToLower(strings.TrimSpace(address))

	for _, adminAddr := range s.adminConfig.AdminAddresses {
		if strings.ToLower(strings.TrimSpace(adminAddr)) == normalizedAddr {
			return true
		}
	}

	return false
}

// AdminAuthMiddleware wraps a handler to require admin authentication
func (s *Server) AdminAuthMiddleware(next httprouter.Handle) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		// If admin auth is not enabled, allow all requests
		if s.adminConfig == nil || !s.adminConfig.Enabled {
			next(w, r, ps)
			return
		}

		// Check for address in header (set by wallet/frontend)
		address := r.Header.Get("X-Admin-Address")
		if address == "" {
			// Try to get from query param as fallback
			address = r.URL.Query().Get("admin_address")
		}

		s.logger.Infof("AdminAuthMiddleware: Checking address='%s', authorized addresses=%v", 
			address, s.adminConfig.AdminAddresses)

		if address == "" {
			write(w, ErrString("Admin authentication required: missing address"), http.StatusUnauthorized)
			return
		}

		// Verify address is in admin whitelist
		if !s.IsAdminAddress(address) {
			s.logger.Warnf("AdminAuthMiddleware: Address '%s' not in whitelist", address)
			write(w, ErrString("Access denied: address not authorized as admin"), http.StatusForbidden)
			return
		}

		s.logger.Infof("AdminAuthMiddleware: Address '%s' authorized successfully", address)

		// Check signature if provided (optional enhanced security)
		signature := r.Header.Get("X-Admin-Signature")
		if signature != "" {
			challenge := r.Header.Get("X-Admin-Challenge")
			if challenge == "" {
				write(w, ErrString("Admin authentication: signature provided but no challenge"), http.StatusBadRequest)
				return
			}

			// Verify signature
			if err := s.verifyAdminSignature(address, challenge, signature); err != nil {
				write(w, ErrString("Admin authentication failed: invalid signature"), http.StatusUnauthorized)
				return
			}
		}

		// Authentication successful, proceed to handler
		next(w, r, ps)
	}
}

// ErrString is a simple error type for string messages
type ErrString string

func (e ErrString) Error() string {
	return string(e)
}

// verifyAdminSignature verifies that a signature matches the expected address
func (s *Server) verifyAdminSignature(address, challenge, signatureHex string) error {
	// Decode signature from hex
	signatureBytes, err := hex.DecodeString(strings.TrimPrefix(signatureHex, "0x"))
	if err != nil {
		return err
	}

	// Decode address
	addressBytes, err := crypto.NewAddressFromString(address)
	if err != nil {
		return err
	}

	// Verify the signature
	publicKey, err := crypto.NewPublicKeyFromBytes(signatureBytes[:32])
	if err != nil {
		return err
	}

	// Check that the public key matches the address
	derivedAddress := publicKey.Address()
	if !derivedAddress.Equals(addressBytes) {
		return ErrString("signature verification failed")
	}

	return nil
}

// AdminVerify endpoint - allows frontend to verify admin status
func (s *Server) AdminVerify(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	type AdminVerifyRequest struct {
		Address string `json:"address"`
	}

	type AdminVerifyResponse struct {
		IsAdmin bool   `json:"is_admin"`
		Message string `json:"message"`
	}

	// Parse request
	var req AdminVerifyRequest
	if ok := unmarshal(w, r, &req); !ok {
		return
	}

	// Check if address is admin
	isAdmin := s.IsAdminAddress(req.Address)

	response := AdminVerifyResponse{
		IsAdmin: isAdmin,
		Message: "OK",
	}

	if !isAdmin {
		response.Message = "Address not authorized as admin"
	}

	write(w, response, http.StatusOK)
}

// AdminConfig endpoint - returns admin configuration status (not addresses for security)
func (s *Server) AdminConfig(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	type AdminConfigResponse struct {
		Enabled      bool `json:"enabled"`
		AdminCount   int  `json:"admin_count"`
		RequiresSig  bool `json:"requires_signature"`
	}

	response := AdminConfigResponse{
		Enabled:     s.adminConfig != nil && s.adminConfig.Enabled,
		AdminCount:  0,
		RequiresSig: false, // Could be made configurable
	}

	if response.Enabled {
		response.AdminCount = len(s.adminConfig.AdminAddresses)
	}

	write(w, response, http.StatusOK)
}
