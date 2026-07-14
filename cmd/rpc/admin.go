package rpc

import (
	"bytes"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/canopy-network/canopy/fsm"

	"github.com/canopy-network/canopy/lib"
	"github.com/canopy-network/canopy/lib/crypto"
	"github.com/julienschmidt/httprouter"
	"github.com/shirou/gopsutil/cpu"
	"github.com/shirou/gopsutil/disk"
	"github.com/shirou/gopsutil/mem"
	"github.com/shirou/gopsutil/net"
	"github.com/shirou/gopsutil/process"
	"google.golang.org/protobuf/reflect/protoreflect"
)

const defaultDevFaucetAmount uint64 = 100000000 // 100 PROOF in uproof (micro-denomination)

type devFaucetResponse struct {
	TxHash    string `json:"txHash"`
	Amount    uint64 `json:"amount"`
	Recipient string `json:"recipient"`
	Submitted bool   `json:"submitted"`
}

// Keystore responds with the local keystore
func (s *Server) Keystore(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Attempt to create a new keystore from the specified file path.
	keystore, err := crypto.NewKeystoreFromFile(s.config.DataDirPath)
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}

	// Write keystore to http response
	write(w, keystore, http.StatusOK)
}

// KeystoreNewKey adds a new key to the keystore
func (s *Server) KeystoreNewKey(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the keystore handler with a callback to create and import a new private key
	s.keystoreHandler(w, r, func(k *crypto.Keystore, ptr *keystoreRequest) (any, error) {
		// Generate a new BLS12381 private key.
		pk, err := crypto.NewBLS12381PrivateKey()
		if err != nil {
			return nil, err
		}

		// Import the newly generated private key into the keystore
		address, err := k.ImportRaw(pk.Bytes(), ptr.Password, crypto.ImportRawOpts{
			Nickname: ptr.Nickname,
		})
		if err != nil {
			return nil, err
		}
		// Update the keystore on disk and return newly created address
		return address, k.SaveToFile(s.config.DataDirPath)
	})
}

// KeystoreImport adds a new key to the keystore using an encrypted private key
func (s *Server) KeystoreImport(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the keystore handler with a callback to import an ecrypted private key
	s.keystoreHandler(w, r, func(k *crypto.Keystore, ptr *keystoreRequest) (any, error) {
		// Attempt to import the encrypted private key into the keystore
		if err := k.Import(&ptr.EncryptedPrivateKey, crypto.ImportOpts{
			Address:  ptr.Address,
			Nickname: ptr.Nickname,
		}); err != nil {
			return nil, err
		}
		// Update the keystore on disk and return newly created address
		return ptr.Address, k.SaveToFile(s.config.DataDirPath)
	})
}

// KeystoreImportRaw adds a new key to the keystore using a raw private key
func (s *Server) KeystoreImportRaw(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the keystore handler with a callback to import a raw private key
	s.keystoreHandler(w, r, func(k *crypto.Keystore, ptr *keystoreRequest) (any, error) {
		// Attempt to import the raw private key into the keystore
		address, err := k.ImportRaw(ptr.PrivateKey, ptr.Password, crypto.ImportRawOpts{
			Nickname: ptr.Nickname,
		})
		if err != nil {
			return nil, err
		}
		// Update the keystore on disk and return newly created address
		return address, k.SaveToFile(s.config.DataDirPath)
	})
}

// KeystoreDelete removes a key from the keystore using either the address or nickname
func (s *Server) KeystoreDelete(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the keystore handler with a callback to perform the deletion
	s.keystoreHandler(w, r, func(k *crypto.Keystore, ptr *keystoreRequest) (any, error) {
		if err := k.DeleteKey(ptr.Password, crypto.DeleteOpts{
			Address:  ptr.Address,
			Nickname: ptr.Nickname,
		}); err != nil {
			return nil, err
		}
		// Update the keystore on disk and return the account address
		return ptr.Address, k.SaveToFile(s.config.DataDirPath)
	})
}

// KeystoreGetKeyGroup retrieves the key group associated with an address or nickname
func (s *Server) KeystoreGetKeyGroup(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the keystore handler with a callback to perform the query
	s.keystoreHandler(w, r, func(k *crypto.Keystore, ptr *keystoreRequest) (any, error) {
		// Get and return the keygroup
		return k.GetKeyGroup(ptr.Password, crypto.GetKeyGroupOpts{
			Address:  ptr.Address,
			Nickname: ptr.Nickname,
		})
	})
}

// TransactionSend sends an amount to another address
func (s *Server) TransactionSend(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the transaction handler with a callback that creates the transaction
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Convert the output address string from the request to a crypto.Address type.
		toAddress, err := crypto.NewAddressFromString(ptr.Output)
		if err != nil {
			return nil, err
		}

		// Retrieve the fee required for this type of transaction
		if err = s.getFeeFromState(ptr, fsm.MessageSendName); err != nil {
			return nil, err
		}

		// Create and return the transaction to be sent
		return fsm.NewSendTransaction(p, toAddress, ptr.Amount, s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight(), ptr.Memo)
	})
}

// DevFaucet sends a small amount from the local validator account to a target address for local testing.
func (s *Server) DevFaucet(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ptr := new(faucetRequest)
	if ok := unmarshal(w, r, ptr); !ok {
		return
	}
	if len(ptr.Address) == 0 {
		write(w, fmt.Errorf("address is required"), http.StatusBadRequest)
		return
	}
	if ptr.Amount == 0 {
		ptr.Amount = defaultDevFaucetAmount
	}

	privateKey, err := crypto.NewBLS12381PrivateKeyFromFile(filepath.Join(s.config.DataDirPath, lib.ValKeyPath))
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}

	txReq := &txRequest{Fee: 0}
	if err = s.getFeeFromState(txReq, fsm.MessageSendName); err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}

	tx, err := fsm.NewSendTransaction(
		privateKey,
		crypto.NewAddress(ptr.Address),
		ptr.Amount,
		s.config.NetworkID,
		s.config.ChainId,
		txReq.Fee,
		s.controller.ChainHeight(),
		"dev faucet",
	)
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}

	txHash, err := tx.GetHash()
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}
	txBytes, err := lib.Marshal(tx)
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}
	if err = s.controller.SendTxMsgs([][]byte{txBytes}); err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}

	write(w, devFaucetResponse{
		TxHash:    hex.EncodeToString(txHash),
		Amount:    ptr.Amount,
		Recipient: crypto.NewAddress(ptr.Address).String(),
		Submitted: true,
	}, http.StatusOK)
}

// TransactionSendVesting sends an amount to another address with a recipient vesting schedule.
func (s *Server) TransactionSendVesting(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		toAddress, err := crypto.NewAddressFromString(ptr.Output)
		if err != nil {
			return nil, err
		}
		if err = s.getFeeFromState(ptr, fsm.MessageSendName); err != nil {
			return nil, err
		}
		return fsm.NewSendTransactionWithVesting(
			p,
			toAddress,
			ptr.Amount,
			ptr.VestingStartHeight,
			ptr.VestingCliffHeight,
			ptr.VestingEndHeight,
			s.config.NetworkID,
			s.config.ChainId,
			ptr.Fee,
			s.controller.ChainHeight(),
			ptr.Memo,
		)
	})
}

// TransactionStake stakes a validator
func (s *Server) TransactionStake(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the transaction handler with a callback that creates the transaction
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Convert the output address from string to a crypto.Address type
		outputAddress, err := crypto.NewAddressFromString(ptr.Output)
		if err != nil {
			return nil, err
		}
		// Convert comma separated string of committees to uint64
		committees, err := stringToCommittees(ptr.Committees)
		if err != nil {
			return nil, err
		}
		// Convert the public key from string to a crypto.PublicKey
		pk, err := crypto.NewPublicKeyFromString(ptr.PubKey)
		if err != nil {
			return nil, err
		}
		// Retrieve the fee required for this type of transaction
		if err = s.getFeeFromState(ptr, fsm.MessageStakeName); err != nil {
			return nil, err
		}

		// Create and return the transaction to be sent
		return fsm.NewStakeTx(p, pk.Bytes(), outputAddress, ptr.NetAddress, committees, ptr.Amount, s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight(), ptr.Delegate, ptr.EarlyWithdrawal, ptr.Memo)
	})
}

// TransactionStake edit-stakes an existing validator
func (s *Server) TransactionEditStake(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the transaction handler with a callback that creates the transaction
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Convert the output address from string to a crypto.Address type
		outputAddress, err := crypto.NewAddressFromString(ptr.Output)
		if err != nil {
			return nil, err
		}
		// Convert comma separated string of committees to uint64
		committees, err := stringToCommittees(ptr.Committees)
		if err != nil {
			return nil, err
		}
		// Retrieve the fee required for this type of transaction
		if err = s.getFeeFromState(ptr, fsm.MessageEditStakeName); err != nil {
			return nil, err
		}
		// Create and return the transaction to be sent
		return fsm.NewEditStakeTx(p, crypto.NewAddress(ptr.Address), outputAddress, ptr.NetAddress, committees, ptr.Amount, s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight(), ptr.EarlyWithdrawal, ptr.Memo)
	})
}

// TransactionStake edit-stakes an existing validator
func (s *Server) TransactionUnstake(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the transaction handler with a callback that creates the transaction
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Retrieve the fee required for this type of transaction
		if err := s.getFeeFromState(ptr, fsm.MessageUnstakeName); err != nil {
			return nil, err
		}
		// Create and return the transaction to be sent
		return fsm.NewUnstakeTx(p, crypto.NewAddress(ptr.Address), s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight(), ptr.Memo)
	})
}

// TransactionPause pauses an active validator
func (s *Server) TransactionPause(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the transaction handler with a callback that creates the transaction
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Retrieve the fee required for this type of transaction
		if err := s.getFeeFromState(ptr, fsm.MessagePauseName); err != nil {
			return nil, err
		}
		// Create and return the transaction to be sent
		return fsm.NewPauseTx(p, crypto.NewAddress(ptr.Address), s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight(), ptr.Memo)
	})
}

// TransactionUnpause unpauses a paused validator
func (s *Server) TransactionUnpause(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the transaction handler with a callback that creates the transaction
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Retrieve the fee required for this type of transaction
		if err := s.getFeeFromState(ptr, fsm.MessageUnpauseName); err != nil {
			return nil, err
		}
		// Create and return the transaction to be sent
		return fsm.NewUnpauseTx(p, crypto.NewAddress(ptr.Address), s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight(), ptr.Memo)
	})
}

// TransactionChangeParam proposes a governance parameter change
func (s *Server) TransactionChangeParam(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the transaction handler with a callback that creates the transaction
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Convert ParamSpace string to the proper ParamSpace name
		ptr.ParamSpace = fsm.FormatParamSpace(ptr.ParamSpace)
		// Retrieve the fee required for this type of transaction
		if err := s.getFeeFromState(ptr, fsm.MessageChangeParameterName); err != nil {
			return nil, err
		}
		// Handle upgrade enforcement
		if ptr.ParamKey == fsm.ParamProtocolVersion {
			// Create and return the transaction to be sent
			return fsm.NewChangeParamTxString(p, ptr.ParamSpace, ptr.ParamKey, ptr.ParamValue, ptr.StartBlock, ptr.EndBlock, s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight(), ptr.Memo)
		}

		// Parse the parameter value to a uint64 for non-string parameters
		paramValue, err := strconv.ParseUint(ptr.ParamValue, 10, 64)
		if err != nil {
			return nil, err
		}
		// Create and return the transaction to be sent
		return fsm.NewChangeParamTxUint64(p, ptr.ParamSpace, ptr.ParamKey, paramValue, ptr.StartBlock, ptr.EndBlock, s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight(), ptr.Memo)
	})
}

// TransactionDAOTransfer propose a treasury subsidy
func (s *Server) TransactionDAOTransfer(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the transaction handler with a callback that creates the transaction
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Retrieve the fee required for this type of transaction
		if err := s.getFeeFromState(ptr, fsm.MessageDAOTransferName); err != nil {
			return nil, err
		}
		// Create and return the transaction to be sent
		return fsm.NewDAOTransferTx(p, ptr.Amount, ptr.StartBlock, ptr.EndBlock, s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight(), ptr.Mint, ptr.Memo)
	})
}

// TransactionSubsidy subsidizes the reward pool of a committee
func (s *Server) TransactionSubsidy(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the transaction handler with a callback that creates the transaction
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Create a default chainid of 0
		chainId := uint64(0)
		// Convert comma separated string of committees to uint64
		if c, err := stringToCommittees(ptr.Committees); err == nil {
			chainId = c[0]
		}
		// Retrieve the fee required for this type of transaction
		if err := s.getFeeFromState(ptr, fsm.MessageSubsidyName); err != nil {
			return nil, err
		}
		// Create and return the transaction to be sent
		return fsm.NewSubsidyTx(p, ptr.Amount, chainId, ptr.OpCode, s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight(), ptr.Memo)
	})
}

// TransactionCreateOrder creates a sell order
func (s *Server) TransactionCreateOrder(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the transaction handler with a callback that creates the transaction
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Create a default chainid of 0
		chainId := uint64(0)
		// Convert comma separated string of committees to uint64
		if c, err := stringToCommittees(ptr.Committees); err == nil {
			chainId = c[0]
		}
		// Retrieve the fee required for this type of transaction
		if err := s.getFeeFromState(ptr, fsm.MessageCreateOrderName); err != nil {
			return nil, err
		}
		// Create and return the transaction to be sent
		return fsm.NewCreateOrderTx(p, ptr.Amount, ptr.ReceiveAmount, chainId, ptr.Data, ptr.ReceiveAddress, s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight(), ptr.Memo)
	})
}

// TransactionCreateOrder edits an existing sell order
func (s *Server) TransactionEditOrder(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the transaction handler with a callback that creates the transaction
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Create a default chainid of 0
		chainId := uint64(0)
		// Convert comma separated string of committees to uint64
		if c, err := stringToCommittees(ptr.Committees); err == nil {
			chainId = c[0]
		}
		if err := s.getFeeFromState(ptr, fsm.MessageEditOrderName); err != nil {
			return nil, err
		}
		// Create and return the transaction to be sent
		return fsm.NewEditOrderTx(p, ptr.OrderId, ptr.Amount, ptr.ReceiveAmount, chainId, ptr.Data, ptr.ReceiveAddress, s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight(), ptr.Memo)
	})
}

// TransactionDeleteOrder deletes an existing sell order
func (s *Server) TransactionDeleteOrder(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the transaction handler with a callback that creates the transaction
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Create a default chainid of 0
		chainId := uint64(0)
		// Convert comma separated string of committees to uint64
		if c, err := stringToCommittees(ptr.Committees); err == nil {
			chainId = c[0]
		}
		// Retrieve the fee required for this type of transaction
		if err := s.getFeeFromState(ptr, fsm.MessageDeleteOrderName); err != nil {
			return nil, err
		}
		// Create and return the transaction to be sent
		return fsm.NewDeleteOrderTx(p, ptr.OrderId, chainId, s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight(), ptr.Memo)
	})
}

// TransactionDexLimitOrder creates a new dex limit order for the 'next batch'
func (s *Server) TransactionDexLimitOrder(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the transaction handler with a callback that creates the transaction
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Create a default chainid of 0
		chainId := uint64(0)
		// Convert comma separated string of committees to uint64
		if c, err := stringToCommittees(ptr.Committees); err == nil {
			chainId = c[0]
		}
		// Retrieve the fee required for this type of transaction
		if err := s.getFeeFromState(ptr, fsm.MessageDexLimitOrderName); err != nil {
			return nil, err
		}
		// Create and return the transaction to be sent
		return fsm.NewDexLimitOrder(p, ptr.Amount, ptr.ReceiveAmount, chainId, s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight(), ptr.Memo)
	})
}

// TransactionDexLiquidityDeposit creates a new dex liquidity deposit command for the 'next batch'
func (s *Server) TransactionDexLiquidityDeposit(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the transaction handler with a callback that creates the transaction
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Create a default chainid of 0
		chainId := uint64(0)
		// Convert comma separated string of committees to uint64
		if c, err := stringToCommittees(ptr.Committees); err == nil {
			chainId = c[0]
		}
		// Retrieve the fee required for this type of transaction
		if err := s.getFeeFromState(ptr, fsm.MessageDexLiquidityDepositName); err != nil {
			return nil, err
		}
		// Create and return the transaction to be sent
		return fsm.NewDexLiquidityDeposit(p, ptr.Amount, chainId, s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight(), ptr.Memo)
	})
}

// TransactionDexLiquidityWithdraw creates a new dex liquidity withdraw command for the 'next batch'
func (s *Server) TransactionDexLiquidityWithdraw(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the transaction handler with a callback that creates the transaction
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Create a default chainid of 0
		chainId := uint64(0)
		// Convert comma separated string of committees to uint64
		if c, err := stringToCommittees(ptr.Committees); err == nil {
			chainId = c[0]
		}
		// Retrieve the fee required for this type of transaction
		if err := s.getFeeFromState(ptr, fsm.MessageDexLiquidityWithdrawName); err != nil {
			return nil, err
		}
		// Create and return the transaction to be sent
		return fsm.NewDexLiquidityWithdraw(p, ptr.Percent, chainId, s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight(), ptr.Memo)
	})
}

// TransactionLockOrder locks an existing sell order
func (s *Server) TransactionLockOrder(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the transaction handler with a callback that creates the transaction
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Retrieve the fee required for this type of transaction
		if err := s.getFeeFromState(ptr, fsm.MessageSendName, true); err != nil {
			return nil, err
		}
		// convert the order id to bytes
		oId, err := lib.StringToBytes(ptr.OrderId)
		if err != nil {
			return nil, err
		}
		// Create and return the transaction to be sent
		return fsm.NewLockOrderTx(p, lib.LockOrder{OrderId: oId, ChainId: s.config.ChainId, BuyerSendAddress: p.PublicKey().Address().Bytes(), BuyerReceiveAddress: ptr.ReceiveAddress}, s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight())
	})
}

// TransactionCloseOrder completes a swap
func (s *Server) TransactionCloseOrder(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Retrieve the fee required for this type of transaction
		if err := s.getFeeFromState(ptr, fsm.MessageSendName, true); err != nil {
			return nil, err
		}
		// create a variable for the root chain id
		var rootChainId uint64
		// get a read only state
		if err := s.readOnlyState(0, func(s *fsm.StateMachine) (err lib.ErrorI) {
			rootChainId, err = s.GetRootChainId()
			return
		}); err != nil {
			return nil, err
		}
		// Execute rpc call to the root chain
		s.rcManager.l.Lock()
		order, err := s.rcManager.GetOrder(rootChainId, 0, ptr.OrderId, s.config.ChainId)
		s.rcManager.l.Unlock()
		if err != nil {
			return nil, err
		}
		if !bytes.Equal(order.BuyerSendAddress, ptr.Address) {
			return nil, fmt.Errorf("not buyer")
		}
		// Don't allow an order to pass that is less than 10 blocks of the lock deadline
		if int64(order.BuyerChainDeadline)-int64(s.controller.ChainHeight()) < 10 {
			return nil, fmt.Errorf("too close to buyer chain deadline")
		}
		// convert the order id to bytes
		oId, err := lib.StringToBytes(ptr.OrderId)
		if err != nil {
			return nil, err
		}
		// Create the close order structure
		co := lib.CloseOrder{OrderId: oId, ChainId: s.config.ChainId, CloseOrder: true}
		// Exit with the new CloseOrderTx
		return fsm.NewCloseOrderTx(p, co, crypto.NewAddress(order.SellerReceiveAddress), order.RequestedAmount, s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight())
	})
}

// TransactionStartPoll starts a new poll
func (s *Server) TransactionStartPoll(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the transaction handler with a callback that creates the transaction
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Retrieve the fee required for this type of transaction
		if err := s.getFeeFromState(ptr, fsm.MessageSendName); err != nil {
			return nil, err
		}
		// Create and return the transaction to be sent
		return fsm.NewStartPollTransaction(p, ptr.PollJSON, s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight())
	})
}

// TransactionVotePoll votes on a proposal
func (s *Server) TransactionVotePoll(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Call the transaction handler with a callback that creates the transaction
	s.txHandler(w, r, func(p crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error) {
		// Retrieve the fee required for this type of transaction
		if err := s.getFeeFromState(ptr, fsm.MessageSendName); err != nil {
			return nil, err
		}
		// Create and return the transaction to be sent
		return fsm.NewVotePollTransaction(p, ptr.PollJSON, ptr.PollApprove, s.config.NetworkID, s.config.ChainId, ptr.Fee, s.controller.ChainHeight())
	})
}

// ConsensusInfo retrieves node consensus information
func (s *Server) ConsensusInfo(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	if err := r.ParseForm(); err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}
	summary, err := s.controller.ConsensusSummary()
	if err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	w.Header().Set(ContentType, ApplicationJSON)
	w.WriteHeader(http.StatusOK)
	if _, e := w.Write(summary); e != nil {
		s.logger.Error(e.Error())
	}
}

// PeerInfo retrieves node peer information
func (s *Server) PeerInfo(w http.ResponseWriter, _ *http.Request, _ httprouter.Params) {
	peers, numInbound, numOutbound := s.controller.P2P.GetAllInfos()
	write(w, &peerInfoResponse{
		ID:          s.controller.P2P.ID(),
		NumPeers:    numInbound + numOutbound,
		NumInbound:  numInbound,
		NumOutbound: numOutbound,
		Peers:       peers,
	}, http.StatusOK)
}

// PeerBook retrieves the node's peer book
func (s *Server) PeerBook(w http.ResponseWriter, _ *http.Request, _ httprouter.Params) {
	write(w, s.controller.P2P.GetBookPeers(), http.StatusOK)
}

// Config retrieves the node's configuration file
func (s *Server) Config(w http.ResponseWriter, _ *http.Request, _ httprouter.Params) {
	write(w, s.config, http.StatusOK)
}

// txHandler is a helper function that abstracts common workflows of sending transactions.
// It takes an HTTP response writer, an HTTP request, and a callback function that performs
// transaction-specific logic using the private key and transaction request data.
func (s *Server) txHandler(w http.ResponseWriter, r *http.Request, callback func(privateKey crypto.PrivateKeyI, ptr *txRequest) (lib.TransactionI, error)) {
	// Create a new transaction request object.
	ptr := new(txRequest)

	// Parse and validate the incoming HTTP request JSON, unmarshalling its body into ptr.
	if ok := unmarshal(w, r, ptr); !ok {
		return
	}

	// Initialize a new keystore from the server's configured data directory.
	keystore, ok := newKeystore(w, s.config.DataDirPath)
	if !ok {
		return
	}

	// Update the transaction request with address information derived from the nickname, if available.
	getAddressFromNickname(ptr, keystore)

	// Determine the signer address; use the supplied address if signer is unspecified.
	signer := ptr.Signer
	if len(signer) == 0 {
		signer = ptr.Address
	}

	// Retrieve the private key for the signer from the keystore using the provided password.
	privateKey, err := keystore.GetKey(signer, ptr.Password)
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}
	// Set the public key in transaction request for reference.
	ptr.PubKey = privateKey.PublicKey().String()

	// Call the provided callback function with the private key and transaction request.
	p, err := callback(privateKey, ptr)
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}
	// Check if the transaction should be submitted to the network.
	if ptr.Submit {
		// Submit the transaction for processing.
		s.submitTxs(w, []lib.TransactionI{p})
	} else {
		// Marshal the transaction into JSON and write it to the response
		bz, e := lib.MarshalJSONIndent(p)
		if e != nil {
			write(w, e, http.StatusBadRequest)
			return
		}
		if _, err = w.Write(bz); err != nil {
			s.logger.Error(err.Error())
			return
		}
	}
}

// AddVote adds a vote to a proposal
func (s *Server) AddVote(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Initialize a map to hold government proposals.
	proposals := make(fsm.GovProposals)
	// Load existing proposals from a file
	if err := proposals.NewFromFile(s.config.DataDirPath); err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	// Create a new instance of voteRequest to hold the incoming request data.
	j := new(voteRequest)
	// Unmarshal the request body into the voteRequest struct
	if !unmarshal(w, r, j) {
		return
	}
	if err := proposals.Add(j.Proposal, j.Approve); err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	// Save the updated proposals back to the file system
	if err := proposals.SaveToFile(s.config.DataDirPath); err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	// Respond with a success status and the vote request data if everything succeeds
	write(w, j, http.StatusOK)
}

// DelVote removes a vote from a proposal
func (s *Server) DelVote(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Initialize a map to hold government proposals.
	proposals := make(fsm.GovProposals)
	// Load existing proposals from a file
	if err := proposals.NewFromFile(s.config.DataDirPath); err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	// Create a new instance of voteRequest to hold the incoming request data.
	j := new(voteRequest)
	// Unmarshal the request body into the voteRequest struct
	if !unmarshal(w, r, j) {
		return
	}
	// Delete the proposal vote
	proposals.Del(j.Proposal)
	// Save the updated proposals back to the file system
	if err := proposals.SaveToFile(s.config.DataDirPath); err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	// Respond with a success status and the vote request data if everything succeeds
	write(w, j, http.StatusOK)
}

// ResourceUsage retrieves node resource usage
func (s *Server) ResourceUsage(w http.ResponseWriter, _ *http.Request, _ httprouter.Params) {
	pm, err := mem.VirtualMemory() // os memory
	if err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	c, err := cpu.Times(false) // os cpu
	if err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	cp, err := cpu.Percent(0, false) // os cpu percent
	if err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	d, err := disk.Usage("/") // os disk
	if err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	p, err := process.NewProcess(int32(os.Getpid()))
	if err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	name, err := p.Name()
	if err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	cpuPercent, err := p.CPUPercent()
	if err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	ioCounters, err := net.IOCounters(false)
	if err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	status, err := p.Status()
	if err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	fds, err := fdCount(p.Pid)
	if err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	numThreads, err := p.NumThreads()
	if err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	memPercent, err := p.MemoryPercent()
	if err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	utc, err := p.CreateTime()
	if err != nil {
		write(w, err, http.StatusInternalServerError)
		return
	}
	write(w, resourceUsageResponse{
		Process: ProcessResourceUsage{
			Name:          name,
			Status:        status,
			CreateTime:    time.Unix(utc, 0).Format(time.RFC822),
			FDCount:       uint64(fds),
			ThreadCount:   uint64(numThreads),
			MemoryPercent: float64(memPercent),
			CPUPercent:    cpuPercent,
		},
		System: SystemResourceUsage{
			TotalRAM:        pm.Total,
			AvailableRAM:    pm.Available,
			UsedRAM:         pm.Used,
			UsedRAMPercent:  pm.UsedPercent,
			FreeRAM:         pm.Free,
			UsedCPUPercent:  cp[0],
			UserCPU:         c[0].User,
			SystemCPU:       c[0].System,
			IdleCPU:         c[0].Idle,
			TotalDisk:       d.Total,
			UsedDisk:        d.Used,
			UsedDiskPercent: d.UsedPercent,
			FreeDisk:        d.Free,
			ReceivedBytesIO: ioCounters[0].BytesRecv,
			WrittenBytesIO:  ioCounters[0].BytesSent,
		},
	}, http.StatusOK)
}

// newKeystore creates and responds with a new Keystore from a local keystore file
func newKeystore(w http.ResponseWriter, path string) (k *crypto.Keystore, ok bool) {

	// Attempt to create a new keystore from keystore file at the specified file path.
	k, err := crypto.NewKeystoreFromFile(path)
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}
	// Set `ok` to true indicating the keystore was successfully created.
	ok = true
	// Return the created keystore and the success status.
	return
}

// keystoreHandler is a helper function that abstracts common workflows of keystore operations
func (s *Server) keystoreHandler(w http.ResponseWriter, r *http.Request, callback func(keystore *crypto.Keystore, ptr *keystoreRequest) (any, error)) {
	// Initialize a new keystore using the provided data directory path
	keystore, ok := newKeystore(w, s.config.DataDirPath)
	if !ok {
		return
	}

	// Create a new keystoreRequest instance to populate with request data
	ptr := new(keystoreRequest)

	// Attempt to unmarshal the request body into the keystoreRequest
	if ok = unmarshal(w, r, ptr); !ok {
		return
	}

	// Invoke the callback with the keystore and request
	p, err := callback(keystore, ptr)
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}
	write(w, p, http.StatusOK)
}

// stringToCommittees converts a comma separated string of committees to uint64
func stringToCommittees(s string) (committees []uint64, error error) {
	i, err := strconv.ParseUint(s, 10, 64) // single int is an option for subsidy txn
	if err == nil {
		return []uint64{i}, nil
	}
	commaSeparatedArr := strings.Split(strings.ReplaceAll(s, " ", ""), ",")
	if len(commaSeparatedArr) == 0 {
		return nil, lib.ErrStringToCommittee(s)
	}
	for _, c := range commaSeparatedArr {
		ui, e := strconv.ParseUint(c, 10, 64)
		if e != nil {
			return nil, e
		}
		committees = append(committees, ui)
	}
	return
}

// getAddressFromNickname retrieves the account address for the supplied nickname
func getAddressFromNickname(ptr *txRequest, keystore *crypto.Keystore) {
	// Populate Signer field if SignerNickname is present
	if len(ptr.Signer) == 0 && ptr.SignerNickname != "" {
		addressString := keystore.NicknameMap[ptr.SignerNickname]
		addressBytes, _ := hex.DecodeString(addressString)
		ptr.Signer = addressBytes
	}

	// Populate Address field if Nickname is present
	if len(ptr.Address) == 0 && ptr.Nickname != "" {
		addressString := keystore.NicknameMap[ptr.Nickname]
		addressBytes, _ := hex.DecodeString(addressString)
		ptr.Address = addressBytes
	}
}

// fdCount returns the number of open file descriptors for the provided process ID
func fdCount(pid int32) (int, error) {
	// Prepare command arguments for lsof to list all file descriptors for the process
	cmd := []string{"-a", "-n", "-P", "-p", strconv.Itoa(int(pid))}
	// Execute the lsof command with provided arguments
	out, err := execCommand("lsof", cmd...)
	if err != nil {
		return 0, err
	}
	// Split the output of the command into individual lines
	lines := strings.Split(string(out), "\n")
	// Initialize a slice to capture non-empty lines representing file descriptors
	var ret []string
	// Loop through each line, starting from the second line (skip header)
	for _, l := range lines[1:] {
		// If the line is empty, continue to the next iteration
		if len(l) == 0 {
			continue
		}
		// Append non-empty lines to the result slice
		ret = append(ret, l)
	}
	// Return the count of file descriptors
	return len(ret), nil
}

// execCommand executres the named program with the provided arguments, returning its output
func execCommand(name string, arg ...string) ([]byte, error) {
	// Create a new command to execute.
	cmd := exec.Command(name, arg...)

	// Initialize a buffer to capture the command output.
	var buf bytes.Buffer

	// Redirect both standard output and standard error to the buffer.
	cmd.Stdout = &buf
	cmd.Stderr = &buf

	// Start the command execution.
	if err := cmd.Start(); err != nil {
		return buf.Bytes(), err
	}

	// Wait for the command to finish executing.
	if err := cmd.Wait(); err != nil {
		return buf.Bytes(), err
	}

	// Return the captured output and a nil error, indicating successful execution.
	return buf.Bytes(), nil
}


// WalletVerify verifies a wallet password without performing any transactions
func (s *Server) WalletVerify(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	req := new(keystoreRequest)
	if !unmarshal(w, r, req) {
		return
	}

	s.logger.Infof("WalletVerify: received request for address: %s, password length: %d", hex.EncodeToString(req.Address), len(req.Password))

	keystore, ok := newKeystore(w, s.config.DataDirPath)
	if !ok {
		s.logger.Warnf("WalletVerify: failed to create keystore")
		return
	}

	// Attempt to decrypt the key with the provided password
	s.logger.Infof("WalletVerify: attempting GetKey...")
	privateKey, err := keystore.GetKey(req.Address, req.Password)
	if err != nil {
		s.logger.Warnf("WalletVerify: GetKey failed with error: %v", err)
		write(w, map[string]string{"error": "authentication failed"}, http.StatusUnauthorized)
		return
	}
	if privateKey == nil {
		s.logger.Warnf("WalletVerify: GetKey returned nil key")
		write(w, map[string]string{"error": "authentication failed"}, http.StatusUnauthorized)
		return
	}

	s.logger.Infof("WalletVerify: SUCCESS - password verified")
	// Password is valid
	write(w, map[string]bool{"valid": true}, http.StatusOK)
}


// AdminPoolTransfer transfers funds between pools using a subsidy transaction
// This is an admin-only operation that leverages the existing subsidy mechanism
func (s *Server) AdminPoolTransfer(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Parse the pool transfer request
	req := new(poolTransferRequest)
	if !unmarshal(w, r, req) {
		return
	}

	s.logger.Infof("AdminPoolTransfer: fromPool=%d, toPool=%d, amount=%d",
		req.FromPoolId, req.ToPoolId, req.Amount)

	// Validate request
	if req.FromPoolId == 0 || req.ToPoolId == 0 {
		write(w, poolTransferResponse{
			Success: false,
			Message: "Invalid pool IDs: both fromPoolId and toPoolId must be non-zero",
		}, http.StatusBadRequest)
		return
	}

	if req.FromPoolId == req.ToPoolId {
		write(w, poolTransferResponse{
			Success: false,
			Message: "Cannot transfer to the same pool",
		}, http.StatusBadRequest)
		return
	}

	if req.Amount == 0 {
		write(w, poolTransferResponse{
			Success: false,
			Message: "Amount must be greater than 0",
		}, http.StatusBadRequest)
		return
	}

	// Get validator private key for signing admin operations
	// NOTE: In production, consider using a dedicated admin key separate from validator key
	privateKey, err := crypto.NewBLS12381PrivateKeyFromFile(filepath.Join(s.config.DataDirPath, lib.ValKeyPath))
	if err != nil {
		s.logger.Errorf("AdminPoolTransfer: failed to load validator key: %v", err)
		write(w, poolTransferResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to load validator key: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	// Get the validator address from the private key
	// This is the address that will be authorized in the plugin
	validatorAddress := privateKey.PublicKey().Address()
	s.logger.Infof("AdminPoolTransfer: Using validator address as admin: %s", hex.EncodeToString(validatorAddress.Bytes()))

	// Read current pool balances from state
	var fromPoolBalance uint64
	if err := s.readOnlyState(0, func(state *fsm.StateMachine) lib.ErrorI {
		var readErr lib.ErrorI
		fromPoolBalance, readErr = state.GetPoolBalance(req.FromPoolId)
		if readErr != nil {
			return readErr
		}
		// Verify toPool exists
		_, readErr = state.GetPoolBalance(req.ToPoolId)
		return readErr
	}); err != nil {
		s.logger.Errorf("AdminPoolTransfer: failed to read pool balances: %v", err)
		write(w, poolTransferResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to read pool balances: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	// Check if source pool has sufficient balance
	if fromPoolBalance < req.Amount {
		write(w, poolTransferResponse{
			Success: false,
			Message: fmt.Sprintf("Insufficient balance in pool %d: has %d, needs %d",
				req.FromPoolId, fromPoolBalance, req.Amount),
		}, http.StatusBadRequest)
		return
	}

	// Create the pool transfer message
	// Use the validator address as the admin address
	msg, err := game2048AnyMessage("MessagePoolTransfer", func(message protoreflect.Message) {
		setUint64Field(message, "from_pool_id", req.FromPoolId)
		setUint64Field(message, "to_pool_id", req.ToPoolId)
		setUint64Field(message, "amount", req.Amount)
		setBytesField(message, "admin_address", validatorAddress.Bytes())
	})
	if err != nil {
		s.logger.Errorf("AdminPoolTransfer: failed to create message: %v", err)
		write(w, poolTransferResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to create transfer message: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	// Create and sign the transaction
	tx := &lib.Transaction{
		MessageType:   "poolTransfer",
		Msg:           msg,
		CreatedHeight: s.controller.ChainHeight(),
		Time:          uint64(time.Now().UnixMicro()),
		Fee:           0,
		NetworkId:     s.config.NetworkID,
		ChainId:       s.config.ChainId,
	}

	if err := tx.Sign(privateKey); err != nil {
		s.logger.Errorf("AdminPoolTransfer: failed to sign transaction: %v", err)
		write(w, poolTransferResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to sign transaction: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	// Get transaction hash
	txHash, err := tx.GetHash()
	if err != nil {
		s.logger.Errorf("AdminPoolTransfer: failed to get tx hash: %v", err)
		write(w, poolTransferResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to get transaction hash: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	// Marshal transaction
	txBytes, err := lib.Marshal(tx)
	if err != nil {
		s.logger.Errorf("AdminPoolTransfer: failed to marshal transaction: %v", err)
		write(w, poolTransferResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to marshal transaction: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	// Submit transaction to the blockchain
	if err := s.controller.SendTxMsgs([][]byte{txBytes}); err != nil {
		s.logger.Errorf("AdminPoolTransfer: failed to submit transaction: %v", err)
		write(w, poolTransferResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to submit transaction: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	s.logger.Infof("AdminPoolTransfer: successfully submitted tx %s (pool %d -> %d, amount %d)",
		hex.EncodeToString(txHash), req.FromPoolId, req.ToPoolId, req.Amount)

	// Return success response
	write(w, poolTransferResponse{
		Success:            true,
		TxHash:             hex.EncodeToString(txHash),
		FromPoolNewBalance: 0, // Will be updated after blockchain processes the tx
		ToPoolNewBalance:   0, // Will be updated after blockchain processes the tx
		Message:            "Pool transfer transaction submitted successfully",
	}, http.StatusOK)
}

// AdminBanPlayer bans a player from gameplay
func (s *Server) AdminBanPlayer(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	req := new(banPlayerRequest)
	if !unmarshal(w, r, req) {
		return
	}

	s.logger.Infof("AdminBanPlayer: targetAddress=%s, reason=%s",
		hex.EncodeToString(req.TargetAddress), req.Reason)

	// Validate request
	if len(req.TargetAddress) == 0 {
		write(w, banPlayerResponse{
			Success: false,
			Message: "Target address is required",
		}, http.StatusBadRequest)
		return
	}

	if req.Reason == "" {
		write(w, banPlayerResponse{
			Success: false,
			Message: "Ban reason is required",
		}, http.StatusBadRequest)
		return
	}

	// Get validator private key for signing admin operations
	privateKey, err := crypto.NewBLS12381PrivateKeyFromFile(filepath.Join(s.config.DataDirPath, lib.ValKeyPath))
	if err != nil {
		s.logger.Errorf("AdminBanPlayer: failed to load validator key: %v", err)
		write(w, banPlayerResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to load validator key: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	validatorAddress := privateKey.PublicKey().Address()
	s.logger.Infof("AdminBanPlayer: Using validator address as admin: %s", hex.EncodeToString(validatorAddress.Bytes()))

	// Create the ban player message
	msg, err := game2048AnyMessage("MessageBanPlayer", func(message protoreflect.Message) {
		setBytesField(message, "target_address", req.TargetAddress)
		setStringField(message, "reason", req.Reason)
		setBytesField(message, "admin_address", validatorAddress.Bytes())
	})
	if err != nil {
		s.logger.Errorf("AdminBanPlayer: failed to create message: %v", err)
		write(w, banPlayerResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to create ban message: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	// Create and sign the transaction
	tx := &lib.Transaction{
		MessageType:   "banPlayer",
		Msg:           msg,
		CreatedHeight: s.controller.ChainHeight(),
		Time:          uint64(time.Now().UnixMicro()),
		Fee:           0,
		NetworkId:     s.config.NetworkID,
		ChainId:       s.config.ChainId,
	}

	if err := tx.Sign(privateKey); err != nil {
		s.logger.Errorf("AdminBanPlayer: failed to sign transaction: %v", err)
		write(w, banPlayerResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to sign transaction: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	txHash, err := tx.GetHash()
	if err != nil {
		s.logger.Errorf("AdminBanPlayer: failed to get tx hash: %v", err)
		write(w, banPlayerResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to get transaction hash: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	txBytes, err := lib.Marshal(tx)
	if err != nil {
		s.logger.Errorf("AdminBanPlayer: failed to marshal transaction: %v", err)
		write(w, banPlayerResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to marshal transaction: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	if err := s.controller.SendTxMsgs([][]byte{txBytes}); err != nil {
		s.logger.Errorf("AdminBanPlayer: failed to submit transaction: %v", err)
		write(w, banPlayerResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to submit transaction: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	s.logger.Infof("AdminBanPlayer: successfully submitted tx %s for player %s",
		hex.EncodeToString(txHash), hex.EncodeToString(req.TargetAddress))

	write(w, banPlayerResponse{
		Success: true,
		TxHash:  hex.EncodeToString(txHash),
		Message: "Player ban transaction submitted successfully",
	}, http.StatusOK)
}

// AdminUnbanPlayer unbans a player
func (s *Server) AdminUnbanPlayer(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	req := new(unbanPlayerRequest)
	if !unmarshal(w, r, req) {
		return
	}

	s.logger.Infof("AdminUnbanPlayer: targetAddress=%s, reason=%s",
		hex.EncodeToString(req.TargetAddress), req.Reason)

	// Validate request
	if len(req.TargetAddress) == 0 {
		write(w, unbanPlayerResponse{
			Success: false,
			Message: "Target address is required",
		}, http.StatusBadRequest)
		return
	}

	if req.Reason == "" {
		write(w, unbanPlayerResponse{
			Success: false,
			Message: "Unban reason is required",
		}, http.StatusBadRequest)
		return
	}

	// Get validator private key for signing admin operations
	privateKey, err := crypto.NewBLS12381PrivateKeyFromFile(filepath.Join(s.config.DataDirPath, lib.ValKeyPath))
	if err != nil {
		s.logger.Errorf("AdminUnbanPlayer: failed to load validator key: %v", err)
		write(w, unbanPlayerResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to load validator key: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	validatorAddress := privateKey.PublicKey().Address()
	s.logger.Infof("AdminUnbanPlayer: Using validator address as admin: %s", hex.EncodeToString(validatorAddress.Bytes()))

	// Create the unban player message
	msg, err := game2048AnyMessage("MessageUnbanPlayer", func(message protoreflect.Message) {
		setBytesField(message, "target_address", req.TargetAddress)
		setStringField(message, "reason", req.Reason)
		setBytesField(message, "admin_address", validatorAddress.Bytes())
	})
	if err != nil {
		s.logger.Errorf("AdminUnbanPlayer: failed to create message: %v", err)
		write(w, unbanPlayerResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to create unban message: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	// Create and sign the transaction
	tx := &lib.Transaction{
		MessageType:   "unbanPlayer",
		Msg:           msg,
		CreatedHeight: s.controller.ChainHeight(),
		Time:          uint64(time.Now().UnixMicro()),
		Fee:           0,
		NetworkId:     s.config.NetworkID,
		ChainId:       s.config.ChainId,
	}

	if err := tx.Sign(privateKey); err != nil {
		s.logger.Errorf("AdminUnbanPlayer: failed to sign transaction: %v", err)
		write(w, unbanPlayerResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to sign transaction: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	txHash, err := tx.GetHash()
	if err != nil {
		s.logger.Errorf("AdminUnbanPlayer: failed to get tx hash: %v", err)
		write(w, unbanPlayerResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to get transaction hash: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	txBytes, err := lib.Marshal(tx)
	if err != nil {
		s.logger.Errorf("AdminUnbanPlayer: failed to marshal transaction: %v", err)
		write(w, unbanPlayerResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to marshal transaction: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	if err := s.controller.SendTxMsgs([][]byte{txBytes}); err != nil {
		s.logger.Errorf("AdminUnbanPlayer: failed to submit transaction: %v", err)
		write(w, unbanPlayerResponse{
			Success: false,
			Message: fmt.Sprintf("Failed to submit transaction: %v", err),
		}, http.StatusInternalServerError)
		return
	}

	s.logger.Infof("AdminUnbanPlayer: successfully submitted tx %s for player %s",
		hex.EncodeToString(txHash), hex.EncodeToString(req.TargetAddress))

	write(w, unbanPlayerResponse{
		Success: true,
		TxHash:  hex.EncodeToString(txHash),
		Message: "Player unban transaction submitted successfully",
	}, http.StatusOK)
}

// AdminValidatorAddress returns the validator address (for admin authentication)
func (s *Server) AdminValidatorAddress(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Load validator private key
	privateKey, err := crypto.NewBLS12381PrivateKeyFromFile(filepath.Join(s.config.DataDirPath, lib.ValKeyPath))
	if err != nil {
		s.logger.Errorf("AdminValidatorAddress: failed to load validator key: %v", err)
		write(w, map[string]any{
			"error": "Failed to load validator key",
		}, http.StatusInternalServerError)
		return
	}

	validatorAddress := privateKey.PublicKey().Address()
	
	write(w, map[string]string{
		"address": hex.EncodeToString(validatorAddress.Bytes()),
	}, http.StatusOK)
}
