package rpc

import (
	"crypto/sha256"
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/canopy-network/canopy/fsm"
	"github.com/canopy-network/canopy/lib"
	"github.com/canopy-network/canopy/lib/crypto"
	"github.com/julienschmidt/httprouter"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/reflect/protodesc"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/types/descriptorpb"
	"google.golang.org/protobuf/types/dynamicpb"
	"google.golang.org/protobuf/types/known/anypb"
)

const (
	game2048StartDailyMessageName    = "startDailyGame"
	game2048StartClassicMessageName  = "startClassicGame"
	game2048SubmitMessageName        = "submitGameResult"
	game2048ClaimDailyMessageName    = "claimDailyReward"
	game2048RedeemClassicMessageName = "redeemClassicPoints"
	game2048ClaimLoginMessageName    = "claimDailyLoginReward"

	game2048StartDailyTypeURL    = "type.googleapis.com/types.MessageStartDailyGame"
	game2048StartClassicTypeURL  = "type.googleapis.com/types.MessageStartClassicGame"
	game2048SubmitTypeURL        = "type.googleapis.com/types.MessageSubmitGameResult"
	game2048ClaimDailyTypeURL    = "type.googleapis.com/types.MessageClaimDailyReward"
	game2048RedeemClassicTypeURL = "type.googleapis.com/types.MessageRedeemClassicPoints"
	game2048ClaimLoginTypeURL    = "type.googleapis.com/types.MessageClaimDailyLoginReward"

	game2048ModeDaily   = 1
	game2048ModeClassic = 2

	game2048StatusActive = 1

	game2048StopPlayerStopped = 1

	game2048DefaultClassicFee               = 90
	game2048DefaultDailyFee                 = 240
	game2048DefaultDailyMoves               = 80
	game2048DefaultDailyPlatformFeeBps      = 500
	game2048DefaultDailyRewardFeeBps        = 8000
	game2048DefaultDailyReserveFeeBps       = 1000
	game2048DefaultDailyShopFeeBps          = 500
	game2048DefaultClassicPlatformFeeBps    = 500
	game2048DefaultClassicReserveFeeBps     = 4500
	game2048DefaultClassicShopFeeBps        = 5000
	game2048DefaultClassicDailyPointsCap    = 2000
	game2048DefaultShopRedemptionRatePoints = 300
	game2048DefaultShopRedemptionRateCnpy   = 1
	game2048DefaultShopMinRedeemPoints      = 300
	game2048DefaultShopRedeemStepPoints     = 300
	game2048DefaultDailyLoginBonusBps       = 2000

	game2048LeaderboardLimit = 20
	game2048PlatformPoolID   = lib.DAOPoolID + 1
	game2048ReservePoolID    = lib.DAOPoolID + 2
	game2048ShopPoolID       = lib.DAOPoolID + 3
	game2048DailyPoolID      = lib.DAOPoolID + 4
)

var (
	game2048Prefix = []byte{18}

	game2048DescriptorFile protoreflect.FileDescriptor
	game2048DescriptorErr  error
)

type game2048EnumValue struct {
	Name   string
	Number int32
}

type game2048ConfigResponse struct {
	DailyFee                 uint64   `json:"dailyFee"`
	ClassicFee               uint64   `json:"classicFee"`
	DailyMaxMoves            uint64   `json:"dailyMaxMoves"`
	DailyPlatformFeeBps      uint64   `json:"dailyPlatformFeeBps"`
	DailyRewardFeeBps        uint64   `json:"dailyRewardFeeBps"`
	DailyReserveFeeBps       uint64   `json:"dailyReserveFeeBps"`
	DailyShopFeeBps          uint64   `json:"dailyShopFeeBps"`
	ClassicPlatformFeeBps    uint64   `json:"classicPlatformFeeBps"`
	ClassicReserveFeeBps     uint64   `json:"classicReserveFeeBps"`
	ClassicShopFeeBps        uint64   `json:"classicShopFeeBps"`
	DailyPayoutBps           []uint64 `json:"dailyPayoutBps"`
	ClassicDailyPointsCap    uint64   `json:"classicDailyPointsCap"`
	ShopRedemptionRatePoints uint64   `json:"shopRedemptionRatePoints"`
	ShopRedemptionRateCnpy   uint64   `json:"shopRedemptionRateCnpy"`
	ShopMinRedeemPoints      uint64   `json:"shopMinRedeemPoints"`
	ShopRedeemStepPoints     uint64   `json:"shopRedeemStepPoints"`
	DailyLoginRewardPoints   []uint64 `json:"dailyLoginRewardPoints"`
	DailyLoginBonusBps       uint64   `json:"dailyLoginBonusBps"`
}

type game2048PlayerResponse struct {
	Address              string `json:"address"`
	Balance              uint64 `json:"balance"`
	DailyGamesStarted    uint64 `json:"dailyGamesStarted"`
	ClassicGamesStarted  uint64 `json:"classicGamesStarted"`
	GamesCompleted       uint64 `json:"gamesCompleted"`
	Wins                 uint64 `json:"wins"`
	Losses               uint64 `json:"losses"`
	BestDailyScore       uint64 `json:"bestDailyScore"`
	BestClassicScore     uint64 `json:"bestClassicScore"`
	BestTile             uint64 `json:"bestTile"`
	TotalScore           uint64 `json:"totalScore"`
	ClassicPointsBalance uint64 `json:"classicPointsBalance"`
	ClassicPointsEarned  uint64 `json:"classicPointsEarned"`
	LoginStreak          uint64 `json:"loginStreak"`
	LastLoginClaimUTCDate string `json:"lastLoginClaimUtcDate"`
	ClassicPointsBonusUTCDate string `json:"classicPointsBonusUtcDate"`
}

type game2048DailyLoginStatusResponse struct {
	Address                  string `json:"address"`
	UTCDate                  string `json:"utcDate"`
	CanClaim                 bool   `json:"canClaim"`
	ClaimedToday             bool   `json:"claimedToday"`
	CurrentStreak            uint64 `json:"currentStreak"`
	NextStreak               uint64 `json:"nextStreak"`
	RewardPoints             uint64 `json:"rewardPoints"`
	BonusBps                 uint64 `json:"bonusBps"`
	BonusActiveToday         bool   `json:"bonusActiveToday"`
	LastLoginClaimUTCDate    string `json:"lastLoginClaimUtcDate"`
	ClassicPointsBonusUTCDate string `json:"classicPointsBonusUtcDate"`
}

type game2048LeaderboardEntryResponse struct {
	GameID    string `json:"gameId"`
	Address   string `json:"address"`
	Score     uint64 `json:"score"`
	MaxTile   uint64 `json:"maxTile"`
	MoveCount uint64 `json:"moveCount"`
	Mode      string `json:"mode"`
	UTCDate   string `json:"utcDate"`
	EndedAt   string `json:"endedAt"`
}

type game2048LeaderboardsResponse struct {
	Daily   []game2048LeaderboardEntryResponse `json:"daily"`
	Classic []game2048LeaderboardEntryResponse `json:"classic"`
}

type game2048DailyPoolResponse struct {
	UTCDate            string `json:"utcDate"`
	EntryCount         uint64 `json:"entryCount"`
	GrossFees          uint64 `json:"grossFees"`
	TreasuryFees       uint64 `json:"treasuryFees"`
	RewardPool         uint64 `json:"rewardPool"`
	Finalized          bool   `json:"finalized"`
	FinalizedAtUnix    uint64 `json:"finalizedAtUnix"`
	DistributedRewards uint64 `json:"distributedRewards"`
	TreasuryLeftover   uint64 `json:"treasuryLeftover"`
}

type game2048TreasuryResponse struct {
	PlatformBalance uint64 `json:"platformBalance"`
	ReserveBalance  uint64 `json:"reserveBalance"`
	ShopBalance     uint64 `json:"shopBalance"`
	UpdatedAtUnix   uint64 `json:"updatedAtUnix"`
}

type game2048ClaimableRewardResponse struct {
	UTCDate      string `json:"utcDate"`
	GameID       string `json:"gameId"`
	Rank         uint64 `json:"rank"`
	RewardAmount uint64 `json:"rewardAmount"`
	Score        uint64 `json:"score"`
	MaxTile      uint64 `json:"maxTile"`
	MoveCount    uint64 `json:"moveCount"`
	EndedAt      string `json:"endedAt"`
	Claimed      bool   `json:"claimed"`
}

type game2048ClaimableRewardsSummary struct {
	Address        string                            `json:"address"`
	TotalClaimable uint64                            `json:"totalClaimable"`
	UnclaimedCount uint64                            `json:"unclaimedCount"`
	Rewards        []game2048ClaimableRewardResponse `json:"rewards"`
}

type game2048StartRequest struct {
	addressRequest
	passwordRequest
	Submit bool `json:"submit"`
}

type game2048SubmitRequest struct {
	addressRequest
	passwordRequest
	GameID          string   `json:"gameId"`
	DeclaredScore   uint64   `json:"declaredScore"`
	DeclaredMaxTile uint64   `json:"declaredMaxTile"`
	StopReason      uint64   `json:"stopReason"`
	Moves           []uint64 `json:"moves"`
	Submit          bool     `json:"submit"`
}

type game2048ClaimDailyRewardRequest struct {
	addressRequest
	passwordRequest
	UTCDate string `json:"utcDate"`
	Submit  bool   `json:"submit"`
}

type game2048ClaimDailyLoginRewardRequest struct {
	addressRequest
	passwordRequest
	Submit bool `json:"submit"`
}

type game2048SessionResponse struct {
	TxHash    string `json:"txHash"`
	GameID    string `json:"gameId"`
	Mode      string `json:"mode"`
	Seed      string `json:"seed"`
	UTCDate   string `json:"utcDate"`
	MaxMoves  uint64 `json:"maxMoves"`
	Submitted bool   `json:"submitted"`
}

type game2048SubmitResponse struct {
	TxHash    string `json:"txHash"`
	GameID    string `json:"gameId"`
	Submitted bool   `json:"submitted"`
}

type game2048ClaimDailyRewardResponse struct {
	TxHash    string `json:"txHash"`
	UTCDate   string `json:"utcDate"`
	Submitted bool   `json:"submitted"`
}

type game2048ClaimDailyLoginRewardResponse struct {
	TxHash    string `json:"txHash"`
	UTCDate   string `json:"utcDate"`
	Submitted bool   `json:"submitted"`
}

type game2048ShopConfigResponse struct {
	RedemptionRatePoints uint64 `json:"redemptionRatePoints"`
	RedemptionRateCnpy   uint64 `json:"redemptionRateCnpy"`
	MinRedeemPoints      uint64 `json:"minRedeemPoints"`
	RedeemStepPoints     uint64 `json:"redeemStepPoints"`
}

type game2048RedeemPreviewRequest struct {
	addressRequest
	BurnPoints uint64 `json:"burnPoints"`
}

type game2048RedeemPreviewResponse struct {
	Address      string `json:"address"`
	BurnPoints   uint64 `json:"burnPoints"`
	PayoutAmount uint64 `json:"payoutAmount"`
	Valid        bool   `json:"valid"`
	Reason       string `json:"reason"`
}

type game2048RedemptionHistoryEntry struct {
	BurnPoints     uint64 `json:"burnPoints"`
	PayoutAmount   uint64 `json:"payoutAmount"`
	RedeemedAtUnix uint64 `json:"redeemedAtUnix"`
	RedeemedAt     string `json:"redeemedAt"`
}

type game2048RedemptionHistoryResponse struct {
	Address     string                           `json:"address"`
	Redemptions []game2048RedemptionHistoryEntry `json:"redemptions"`
}

type game2048RedeemClassicPointsRequest struct {
	addressRequest
	passwordRequest
	BurnPoints uint64 `json:"burnPoints"`
	Submit     bool   `json:"submit"`
}

type game2048RedeemClassicPointsResponse struct {
	TxHash       string `json:"txHash"`
	BurnPoints   uint64 `json:"burnPoints"`
	PayoutAmount uint64 `json:"payoutAmount"`
	Submitted    bool   `json:"submitted"`
}

func (s *Server) Game2048Config(w http.ResponseWriter, _ *http.Request, _ httprouter.Params) {
	var response game2048ConfigResponse
	err := s.readOnlyState(0, func(state *fsm.StateMachine) lib.ErrorI {
		cfg, gameErr := loadGame2048Config(state)
		if gameErr != nil {
			return gameErr
		}
		response = cfg
		return nil
	})
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}
	write(w, response, http.StatusOK)
}

func (s *Server) Game2048Player(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	req := new(addressRequest)
	if !unmarshal(w, r, req) {
		return
	}

	var response game2048PlayerResponse
	err := s.readOnlyState(0, func(state *fsm.StateMachine) lib.ErrorI {
		player, gameErr := loadGame2048Player(state, req.Address)
		if gameErr != nil {
			return gameErr
		}
		response = player
		return nil
	})
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}
	write(w, response, http.StatusOK)
}

func (s *Server) Game2048Leaderboards(w http.ResponseWriter, _ *http.Request, _ httprouter.Params) {
	var response game2048LeaderboardsResponse
	err := s.readOnlyState(0, func(state *fsm.StateMachine) lib.ErrorI {
		var gameErr lib.ErrorI
		response, gameErr = loadGame2048Leaderboards(state)
		return gameErr
	})
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}
	write(w, response, http.StatusOK)
}

func (s *Server) Game2048DailyPool(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	utcDate := r.URL.Query().Get("utcDate")
	if utcDate == "" {
		utcDate = currentUTCDate()
	}

	var response game2048DailyPoolResponse
	err := s.readOnlyState(0, func(state *fsm.StateMachine) lib.ErrorI {
		var gameErr lib.ErrorI
		response, gameErr = loadGame2048DailyPool(state, utcDate)
		return gameErr
	})
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}
	write(w, response, http.StatusOK)
}

func (s *Server) Game2048Treasury(w http.ResponseWriter, _ *http.Request, _ httprouter.Params) {
	var response game2048TreasuryResponse
	err := s.readOnlyState(0, func(state *fsm.StateMachine) lib.ErrorI {
		var gameErr lib.ErrorI
		response, gameErr = loadGame2048Treasury(state)
		return gameErr
	})
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}
	write(w, response, http.StatusOK)
}

func (s *Server) Game2048ClaimableRewards(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	req := new(addressRequest)
	if !unmarshal(w, r, req) {
		return
	}

	var response game2048ClaimableRewardsSummary
	err := s.readOnlyState(0, func(state *fsm.StateMachine) lib.ErrorI {
		var gameErr lib.ErrorI
		response, gameErr = loadGame2048ClaimableRewards(state, req.Address)
		return gameErr
	})
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}
	write(w, response, http.StatusOK)
}

func (s *Server) Game2048ShopConfig(w http.ResponseWriter, _ *http.Request, _ httprouter.Params) {
	var response game2048ShopConfigResponse
	err := s.readOnlyState(0, func(state *fsm.StateMachine) lib.ErrorI {
		cfg, gameErr := loadGame2048Config(state)
		if gameErr != nil {
			return gameErr
		}
		response = game2048ShopConfigResponse{
			RedemptionRatePoints: cfg.ShopRedemptionRatePoints,
			RedemptionRateCnpy:   cfg.ShopRedemptionRateCnpy,
			MinRedeemPoints:      cfg.ShopMinRedeemPoints,
			RedeemStepPoints:     cfg.ShopRedeemStepPoints,
		}
		return nil
	})
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}
	write(w, response, http.StatusOK)
}

func (s *Server) Game2048RedeemPreview(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	req := new(game2048RedeemPreviewRequest)
	if !unmarshal(w, r, req) {
		return
	}

	var response game2048RedeemPreviewResponse
	err := s.readOnlyState(0, func(state *fsm.StateMachine) lib.ErrorI {
		var gameErr lib.ErrorI
		response, gameErr = loadGame2048RedeemPreview(state, s.config.ChainId, req.Address, req.BurnPoints)
		return gameErr
	})
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}
	write(w, response, http.StatusOK)
}

func (s *Server) Game2048Redemptions(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	req := new(addressRequest)
	if !unmarshal(w, r, req) {
		return
	}

	var response game2048RedemptionHistoryResponse
	err := s.readOnlyState(0, func(state *fsm.StateMachine) lib.ErrorI {
		var gameErr lib.ErrorI
		response, gameErr = loadGame2048Redemptions(state, req.Address)
		return gameErr
	})
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}
	write(w, response, http.StatusOK)
}

func (s *Server) Game2048StartDaily(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	s.game2048Start(w, r, game2048ModeDaily)
}

func (s *Server) Game2048StartClassic(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	s.game2048Start(w, r, game2048ModeClassic)
}

func (s *Server) Game2048Submit(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	req := new(game2048SubmitRequest)
	if !unmarshal(w, r, req) {
		return
	}

	keystore, ok := newKeystore(w, s.config.DataDirPath)
	if !ok {
		return
	}

	privateKey, err := keystore.GetKey(req.Address, req.Password)
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}

	tx, buildErr := s.buildGame2048SubmitTx(privateKey, req)
	if buildErr != nil {
		write(w, buildErr, http.StatusBadRequest)
		return
	}

	txHash, hashErr := tx.GetHash()
	if hashErr != nil {
		write(w, hashErr, http.StatusBadRequest)
		return
	}

	if req.Submit {
		txBytes, marshalErr := lib.Marshal(tx)
		if marshalErr != nil {
			write(w, marshalErr, http.StatusBadRequest)
			return
		}
		if sendErr := s.controller.SendTxMsgs([][]byte{txBytes}); sendErr != nil {
			write(w, sendErr, http.StatusBadRequest)
			return
		}
	}

	write(w, game2048SubmitResponse{
		TxHash:    hex.EncodeToString(txHash),
		GameID:    req.GameID,
		Submitted: req.Submit,
	}, http.StatusOK)
}

func (s *Server) Game2048ClaimDailyReward(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	req := new(game2048ClaimDailyRewardRequest)
	if !unmarshal(w, r, req) {
		return
	}

	keystore, ok := newKeystore(w, s.config.DataDirPath)
	if !ok {
		return
	}

	privateKey, err := keystore.GetKey(req.Address, req.Password)
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}

	tx, buildErr := s.buildGame2048ClaimDailyRewardTx(privateKey, req)
	if buildErr != nil {
		write(w, buildErr, http.StatusBadRequest)
		return
	}

	txHash, hashErr := tx.GetHash()
	if hashErr != nil {
		write(w, hashErr, http.StatusBadRequest)
		return
	}

	if req.Submit {
		txBytes, marshalErr := lib.Marshal(tx)
		if marshalErr != nil {
			write(w, marshalErr, http.StatusBadRequest)
			return
		}
		if sendErr := s.controller.SendTxMsgs([][]byte{txBytes}); sendErr != nil {
			write(w, sendErr, http.StatusBadRequest)
			return
		}
	}

	write(w, game2048ClaimDailyRewardResponse{
		TxHash:    hex.EncodeToString(txHash),
		UTCDate:   req.UTCDate,
		Submitted: req.Submit,
	}, http.StatusOK)
}

func (s *Server) Game2048ClaimDailyLoginReward(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	req := new(game2048ClaimDailyLoginRewardRequest)
	if !unmarshal(w, r, req) {
		return
	}

	keystore, ok := newKeystore(w, s.config.DataDirPath)
	if !ok {
		return
	}

	privateKey, err := keystore.GetKey(req.Address, req.Password)
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}

	tx, buildErr := s.buildGame2048ClaimDailyLoginRewardTx(privateKey, req)
	if buildErr != nil {
		write(w, buildErr, http.StatusBadRequest)
		return
	}

	txHash, hashErr := tx.GetHash()
	if hashErr != nil {
		write(w, hashErr, http.StatusBadRequest)
		return
	}

	if req.Submit {
		txBytes, marshalErr := lib.Marshal(tx)
		if marshalErr != nil {
			write(w, marshalErr, http.StatusBadRequest)
			return
		}
		if sendErr := s.controller.SendTxMsgs([][]byte{txBytes}); sendErr != nil {
			write(w, sendErr, http.StatusBadRequest)
			return
		}
	}

	write(w, game2048ClaimDailyLoginRewardResponse{
		TxHash:    hex.EncodeToString(txHash),
		UTCDate:   currentUTCDate(),
		Submitted: req.Submit,
	}, http.StatusOK)
}

func (s *Server) Game2048RedeemClassicPoints(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	req := new(game2048RedeemClassicPointsRequest)
	if !unmarshal(w, r, req) {
		return
	}

	keystore, ok := newKeystore(w, s.config.DataDirPath)
	if !ok {
		return
	}

	privateKey, err := keystore.GetKey(req.Address, req.Password)
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}

	tx, buildErr := s.buildGame2048RedeemClassicPointsTx(privateKey, req)
	if buildErr != nil {
		write(w, buildErr, http.StatusBadRequest)
		return
	}

	txHash, hashErr := tx.GetHash()
	if hashErr != nil {
		write(w, hashErr, http.StatusBadRequest)
		return
	}

	var payoutAmount uint64
	errFSM := s.readOnlyState(0, func(state *fsm.StateMachine) lib.ErrorI {
		preview, gameErr := loadGame2048RedeemPreview(state, s.config.ChainId, req.Address, req.BurnPoints)
		if gameErr != nil {
			return gameErr
		}
		if !preview.Valid {
			return lib.ErrInvalidParams(fmt.Errorf(preview.Reason))
		}
		payoutAmount = preview.PayoutAmount
		return nil
	})
	if errFSM != nil {
		write(w, errFSM, http.StatusBadRequest)
		return
	}

	if req.Submit {
		txBytes, marshalErr := lib.Marshal(tx)
		if marshalErr != nil {
			write(w, marshalErr, http.StatusBadRequest)
			return
		}
		if sendErr := s.controller.SendTxMsgs([][]byte{txBytes}); sendErr != nil {
			write(w, sendErr, http.StatusBadRequest)
			return
		}
	}

	write(w, game2048RedeemClassicPointsResponse{
		TxHash:       hex.EncodeToString(txHash),
		BurnPoints:   req.BurnPoints,
		PayoutAmount: payoutAmount,
		Submitted:    req.Submit,
	}, http.StatusOK)
}

func (s *Server) game2048Start(w http.ResponseWriter, r *http.Request, mode uint64) {
	req := new(game2048StartRequest)
	if !unmarshal(w, r, req) {
		return
	}

	keystore, ok := newKeystore(w, s.config.DataDirPath)
	if !ok {
		return
	}

	privateKey, err := keystore.GetKey(req.Address, req.Password)
	if err != nil {
		write(w, err, http.StatusBadRequest)
		return
	}

	var tx lib.TransactionI
	var response game2048SessionResponse
	errFSM := s.readOnlyState(0, func(state *fsm.StateMachine) lib.ErrorI {
		cfg, gameErr := loadGame2048Config(state)
		if gameErr != nil {
			return gameErr
		}

		utcDate := currentUTCDate()

		if mode == game2048ModeDaily {
			attemptKey := keyForDailyAttempt(utcDate, req.Address)
			entry, entryErr := state.Get(attemptKey)
			if entryErr != nil {
				return entryErr
			}
			if len(entry) > 0 {
				return lib.ErrInvalidParams(fmt.Errorf("daily challenge already played for this address today"))
			}
		}

		account, accountErr := state.GetAccount(crypto.NewAddress(req.Address))
		if accountErr != nil {
			return accountErr
		}

		requiredFee := cfg.ClassicFee
		if mode == game2048ModeDaily {
			requiredFee = cfg.DailyFee
		}
		if account.Amount < requiredFee {
			return fsm.ErrInsufficientFunds()
		}

		createdHeight := s.controller.ChainHeight()
		micros := uint64(time.Now().UnixMicro())
		unsignedTx := &lib.Transaction{
			CreatedHeight: createdHeight,
			Time:          micros,
			Fee:           requiredFee,
			NetworkId:     s.config.NetworkID,
			ChainId:       s.config.ChainId,
		}
		gameID := deriveGameID(req.Address, unsignedTx, mode)

		if mode == game2048ModeDaily {
			tx, gameErr = s.buildGame2048StartDailyTx(privateKey, req.Address, utcDate, gameID, createdHeight, micros, requiredFee)
		} else {
			tx, gameErr = s.buildGame2048StartClassicTx(privateKey, req.Address, gameID, createdHeight, micros, requiredFee)
		}
		if gameErr != nil {
			return gameErr
		}

		hash, hashErr := tx.GetHash()
		if hashErr != nil {
			return hashErr
		}

		session, sessionErr := deriveGame2048Session(tx, gameID, req.Address, mode, utcDate, s.config.ChainId, cfg)
		if sessionErr != nil {
			return sessionErr
		}
		session.TxHash = hex.EncodeToString(hash)
		session.Submitted = req.Submit
		response = session
		return nil
	})
	if errFSM != nil {
		write(w, errFSM, http.StatusBadRequest)
		return
	}

	if req.Submit {
		txBytes, marshalErr := lib.Marshal(tx)
		if marshalErr != nil {
			write(w, marshalErr, http.StatusBadRequest)
			return
		}
		if sendErr := s.controller.SendTxMsgs([][]byte{txBytes}); sendErr != nil {
			write(w, sendErr, http.StatusBadRequest)
			return
		}
	}

	write(w, response, http.StatusOK)
}

func (s *Server) buildGame2048StartDailyTx(
	privateKey crypto.PrivateKeyI,
	address []byte,
	utcDate string,
	gameID []byte,
	createdHeight uint64,
	micros uint64,
	fee uint64,
) (lib.TransactionI, lib.ErrorI) {
	msg, err := game2048AnyMessage("MessageStartDailyGame", func(message protoreflect.Message) {
		setBytesField(message, "player_address", address)
		setStringField(message, "utc_date", utcDate)
		setBytesField(message, "game_id", gameID)
	})
	if err != nil {
		return nil, err
	}

	tx := &lib.Transaction{
		MessageType:   game2048StartDailyMessageName,
		Msg:           msg,
		CreatedHeight: createdHeight,
		Time:          micros,
		Fee:           fee,
		NetworkId:     s.config.NetworkID,
		ChainId:       s.config.ChainId,
	}
	return tx, tx.Sign(privateKey)
}

func (s *Server) buildGame2048StartClassicTx(
	privateKey crypto.PrivateKeyI,
	address []byte,
	gameID []byte,
	createdHeight uint64,
	micros uint64,
	fee uint64,
) (lib.TransactionI, lib.ErrorI) {
	msg, err := game2048AnyMessage("MessageStartClassicGame", func(message protoreflect.Message) {
		setBytesField(message, "player_address", address)
		setBytesField(message, "game_id", gameID)
	})
	if err != nil {
		return nil, err
	}

	tx := &lib.Transaction{
		MessageType:   game2048StartClassicMessageName,
		Msg:           msg,
		CreatedHeight: createdHeight,
		Time:          micros,
		Fee:           fee,
		NetworkId:     s.config.NetworkID,
		ChainId:       s.config.ChainId,
	}
	return tx, tx.Sign(privateKey)
}

func (s *Server) buildGame2048SubmitTx(
	privateKey crypto.PrivateKeyI,
	req *game2048SubmitRequest,
) (lib.TransactionI, lib.ErrorI) {
	gameID, decodeErr := hex.DecodeString(req.GameID)
	if decodeErr != nil {
		return nil, lib.ErrStringToBytes(decodeErr)
	}

	msg, err := game2048AnyMessage("MessageSubmitGameResult", func(message protoreflect.Message) {
		setBytesField(message, "player_address", req.Address)
		setBytesField(message, "game_id", gameID)
		setUint64Field(message, "declared_score", req.DeclaredScore)
		setUint64Field(message, "declared_max_tile", req.DeclaredMaxTile)
		setEnumField(message, "stop_reason", req.StopReason)
		appendEnumListField(message, "moves", req.Moves)
	})
	if err != nil {
		return nil, err
	}

	tx := &lib.Transaction{
		MessageType:   game2048SubmitMessageName,
		Msg:           msg,
		CreatedHeight: s.controller.ChainHeight(),
		Time:          uint64(time.Now().UnixMicro()),
		Fee:           0,
		NetworkId:     s.config.NetworkID,
		ChainId:       s.config.ChainId,
	}
	return tx, tx.Sign(privateKey)
}

func (s *Server) buildGame2048ClaimDailyRewardTx(
	privateKey crypto.PrivateKeyI,
	req *game2048ClaimDailyRewardRequest,
) (lib.TransactionI, lib.ErrorI) {
	msg, err := game2048AnyMessage("MessageClaimDailyReward", func(message protoreflect.Message) {
		setBytesField(message, "player_address", req.Address)
		setStringField(message, "utc_date", req.UTCDate)
	})
	if err != nil {
		return nil, err
	}

	tx := &lib.Transaction{
		MessageType:   game2048ClaimDailyMessageName,
		Msg:           msg,
		CreatedHeight: s.controller.ChainHeight(),
		Time:          uint64(time.Now().UnixMicro()),
		Fee:           0,
		NetworkId:     s.config.NetworkID,
		ChainId:       s.config.ChainId,
	}
	return tx, tx.Sign(privateKey)
}

func (s *Server) buildGame2048RedeemClassicPointsTx(
	privateKey crypto.PrivateKeyI,
	req *game2048RedeemClassicPointsRequest,
) (lib.TransactionI, lib.ErrorI) {
	msg, err := game2048AnyMessage("MessageRedeemClassicPoints", func(message protoreflect.Message) {
		setBytesField(message, "player_address", req.Address)
		setUint64Field(message, "burn_points", req.BurnPoints)
	})
	if err != nil {
		return nil, err
	}

	tx := &lib.Transaction{
		MessageType:   game2048RedeemClassicMessageName,
		Msg:           msg,
		CreatedHeight: s.controller.ChainHeight(),
		Time:          uint64(time.Now().UnixMicro()),
		Fee:           0,
		NetworkId:     s.config.NetworkID,
		ChainId:       s.config.ChainId,
	}
	return tx, tx.Sign(privateKey)
}

func (s *Server) buildGame2048ClaimDailyLoginRewardTx(
	privateKey crypto.PrivateKeyI,
	req *game2048ClaimDailyLoginRewardRequest,
) (lib.TransactionI, lib.ErrorI) {
	msg, err := game2048AnyMessage("MessageClaimDailyLoginReward", func(message protoreflect.Message) {
		setBytesField(message, "player_address", req.Address)
	})
	if err != nil {
		return nil, err
	}

	tx := &lib.Transaction{
		MessageType:   game2048ClaimLoginMessageName,
		Msg:           msg,
		CreatedHeight: s.controller.ChainHeight(),
		Time:          uint64(time.Now().UnixMicro()),
		Fee:           0,
		NetworkId:     s.config.NetworkID,
		ChainId:       s.config.ChainId,
	}
	return tx, tx.Sign(privateKey)
}

func loadGame2048Config(state *fsm.StateMachine) (game2048ConfigResponse, lib.ErrorI) {
	bz, err := state.Get(keyForGameConfig())
	if err != nil {
		return game2048ConfigResponse{}, err
	}
	if len(bz) == 0 {
		return defaultGame2048Config(), nil
	}

	message, decodeErr := decodeGame2048State("GameConfig", bz)
	if decodeErr != nil {
		return game2048ConfigResponse{}, decodeErr
	}
	return game2048ConfigResponse{
		DailyFee:                 uint64Field(message, "daily_start_fee", game2048DefaultDailyFee),
		ClassicFee:               uint64Field(message, "classic_start_fee", game2048DefaultClassicFee),
		DailyMaxMoves:            uint64Field(message, "daily_max_moves", game2048DefaultDailyMoves),
		DailyPlatformFeeBps:      uint64Field(message, "daily_platform_fee_bps", game2048DefaultDailyPlatformFeeBps),
		DailyRewardFeeBps:        uint64Field(message, "daily_reward_fee_bps", game2048DefaultDailyRewardFeeBps),
		DailyReserveFeeBps:       uint64Field(message, "daily_reserve_fee_bps", game2048DefaultDailyReserveFeeBps),
		DailyShopFeeBps:          uint64Field(message, "daily_shop_fee_bps", game2048DefaultDailyShopFeeBps),
		ClassicPlatformFeeBps:    uint64Field(message, "classic_platform_fee_bps", game2048DefaultClassicPlatformFeeBps),
		ClassicReserveFeeBps:     uint64Field(message, "classic_reserve_fee_bps", game2048DefaultClassicReserveFeeBps),
		ClassicShopFeeBps:        uint64Field(message, "classic_shop_fee_bps", game2048DefaultClassicShopFeeBps),
		DailyPayoutBps:           uint64ListField(message, "daily_payout_bps", defaultDailyPayoutBps()),
		ClassicDailyPointsCap:    uint64Field(message, "classic_daily_points_cap", game2048DefaultClassicDailyPointsCap),
		ShopRedemptionRatePoints: uint64Field(message, "shop_redemption_rate_points", game2048DefaultShopRedemptionRatePoints),
		ShopRedemptionRateCnpy:   uint64Field(message, "shop_redemption_rate_cnpy", game2048DefaultShopRedemptionRateCnpy),
		ShopMinRedeemPoints:      uint64Field(message, "shop_min_redeem_points", game2048DefaultShopMinRedeemPoints),
		ShopRedeemStepPoints:     uint64Field(message, "shop_redeem_step_points", game2048DefaultShopRedeemStepPoints),
		DailyLoginRewardPoints:   uint64ListField(message, "daily_login_reward_points", defaultDailyLoginRewardPoints()),
		DailyLoginBonusBps:       uint64Field(message, "daily_login_bonus_bps", game2048DefaultDailyLoginBonusBps),
	}, nil
}

func loadGame2048Treasury(state *fsm.StateMachine) (game2048TreasuryResponse, lib.ErrorI) {
	bz, err := state.Get(keyForGameTreasury())
	if err != nil {
		return game2048TreasuryResponse{}, err
	}
	if len(bz) == 0 {
		return game2048TreasuryResponse{}, nil
	}
	message, decodeErr := decodeGame2048State("GameTreasury", bz)
	if decodeErr != nil {
		return game2048TreasuryResponse{}, decodeErr
	}
	return game2048TreasuryResponse{
		PlatformBalance: uint64Field(message, "platform_balance", 0),
		ReserveBalance:  uint64Field(message, "reserve_balance", 0),
		ShopBalance:     uint64Field(message, "shop_balance", 0),
		UpdatedAtUnix:   uint64Field(message, "updated_at_unix", 0),
	}, nil
}

func loadGame2048DailyPool(state *fsm.StateMachine, utcDate string) (game2048DailyPoolResponse, lib.ErrorI) {
	bz, err := state.Get(keyForDailyPrizePool(utcDate))
	if err != nil {
		return game2048DailyPoolResponse{}, err
	}
	if len(bz) == 0 {
		return game2048DailyPoolResponse{UTCDate: utcDate}, nil
	}

	message, decodeErr := decodeGame2048State("DailyPrizePool", bz)
	if decodeErr != nil {
		return game2048DailyPoolResponse{}, decodeErr
	}
	return game2048DailyPoolResponse{
		UTCDate:            utcDate,
		EntryCount:         uint64Field(message, "entry_count", 0),
		GrossFees:          uint64Field(message, "gross_fees", 0),
		TreasuryFees:       uint64Field(message, "treasury_fees", 0),
		RewardPool:         uint64Field(message, "reward_pool", 0),
		Finalized:          boolField(message, "finalized"),
		FinalizedAtUnix:    uint64Field(message, "finalized_at_unix", 0),
		DistributedRewards: uint64Field(message, "distributed_rewards", 0),
		TreasuryLeftover:   uint64Field(message, "treasury_leftover", 0),
	}, nil
}

func loadGame2048ClaimableRewards(state *fsm.StateMachine, address []byte) (game2048ClaimableRewardsSummary, lib.ErrorI) {
	summary := game2048ClaimableRewardsSummary{
		Address: hex.EncodeToString(address),
		Rewards: make([]game2048ClaimableRewardResponse, 0),
	}
	cfg, err := loadGame2048Config(state)
	if err != nil {
		return summary, err
	}
	rewardDates := make(map[string]struct{})

	iterator, err := state.Iterator(keyForDailyRewardByPlayerPrefix(address))
	if err != nil {
		return summary, err
	}
	defer iterator.Close()

	for iterator.Valid() {
		message, decodeErr := decodeGame2048State("DailyRewardAllocation", iterator.Value())
		if decodeErr != nil {
			return summary, decodeErr
		}
		utcDate := stringField(message, "utc_date", "")
		claimBytes, claimErr := state.Get(keyForDailyRewardClaim(utcDate, address))
		if claimErr != nil {
			return summary, claimErr
		}
		claimed := len(claimBytes) > 0
		rewardAmount := uint64Field(message, "reward_amount", 0)
		if !claimed {
			summary.TotalClaimable += rewardAmount
			summary.UnclaimedCount += 1
		}
		rewardDates[utcDate] = struct{}{}
		summary.Rewards = append(summary.Rewards, game2048ClaimableRewardResponse{
			UTCDate:      utcDate,
			GameID:       hex.EncodeToString(bytesField(message, "game_id")),
			Rank:         uint64Field(message, "rank", 0),
			RewardAmount: rewardAmount,
			Score:        uint64Field(message, "score", 0),
			MaxTile:      uint64Field(message, "max_tile", 0),
			MoveCount:    uint64Field(message, "move_count", 0),
			EndedAt:      unixMicrosToISO(uint64Field(message, "ended_at_unix", 0)),
			Claimed:      claimed,
		})
		iterator.Next()
	}

	pendingIterator, err := state.Iterator(keyForDailySubmissionPrefix())
	if err != nil {
		return summary, err
	}
	defer pendingIterator.Close()

	nowUTC := time.Now().UTC()
	for pendingIterator.Valid() {
		message, decodeErr := decodeGame2048State("DailySubmission", pendingIterator.Value())
		if decodeErr != nil {
			return summary, decodeErr
		}

		playerAddress := bytesField(message, "player_address")
		if hex.EncodeToString(playerAddress) != hex.EncodeToString(address) {
			pendingIterator.Next()
			continue
		}

		utcDate := stringField(message, "utc_date", "")
		if utcDate == "" {
			pendingIterator.Next()
			continue
		}
		if _, alreadyIncluded := rewardDates[utcDate]; alreadyIncluded {
			pendingIterator.Next()
			continue
		}
		if !hasUTCDateEnded(utcDate, nowUTC) {
			pendingIterator.Next()
			continue
		}

		pool, poolErr := loadGame2048DailyPool(state, utcDate)
		if poolErr != nil {
			return summary, poolErr
		}
		if pool.Finalized || pool.RewardPool == 0 {
			pendingIterator.Next()
			continue
		}

		claimBytes, claimErr := state.Get(keyForDailyRewardClaim(utcDate, address))
		if claimErr != nil {
			return summary, claimErr
		}
		if len(claimBytes) > 0 {
			pendingIterator.Next()
			continue
		}

		entries, readErr := readLeaderboardPrefix(state, keyForDailyLeaderboardPrefix(utcDate), "daily", utcDate)
		if readErr != nil {
			return summary, readErr
		}

		rank := 0
		var matched *game2048LeaderboardEntryResponse
		for idx := range entries {
			entry := entries[idx]
			if entry.Address == summary.Address {
				rank = idx + 1
				matched = &entry
				break
			}
		}
		if rank == 0 || matched == nil || rank > len(cfg.DailyPayoutBps) {
			pendingIterator.Next()
			continue
		}

		rewardAmount := calculateGame2048BpsAmount(pool.RewardPool, cfg.DailyPayoutBps[rank-1])
		if rewardAmount == 0 {
			pendingIterator.Next()
			continue
		}

		summary.TotalClaimable += rewardAmount
		summary.UnclaimedCount += 1
		summary.Rewards = append(summary.Rewards, game2048ClaimableRewardResponse{
			UTCDate:      utcDate,
			GameID:       matched.GameID,
			Rank:         uint64(rank),
			RewardAmount: rewardAmount,
			Score:        matched.Score,
			MaxTile:      matched.MaxTile,
			MoveCount:    matched.MoveCount,
			EndedAt:      matched.EndedAt,
			Claimed:      false,
		})
		rewardDates[utcDate] = struct{}{}
		pendingIterator.Next()
	}

	sort.Slice(summary.Rewards, func(i, j int) bool {
		if summary.Rewards[i].UTCDate == summary.Rewards[j].UTCDate {
			return summary.Rewards[i].Rank < summary.Rewards[j].Rank
		}
		return summary.Rewards[i].UTCDate > summary.Rewards[j].UTCDate
	})
	return summary, nil
}

func calculateGame2048BpsAmount(amount uint64, bps uint64) uint64 {
	if bps == 0 || amount == 0 {
		return 0
	}
	return (amount * bps) / 10000
}

func hasUTCDateEnded(utcDate string, now time.Time) bool {
	startOfDay, err := time.Parse("2006-01-02", utcDate)
	if err != nil {
		return false
	}
	return !now.Before(startOfDay.Add(24 * time.Hour))
}

func loadGame2048RedeemPreview(state *fsm.StateMachine, chainID uint64, address []byte, burnPoints uint64) (game2048RedeemPreviewResponse, lib.ErrorI) {
	cfg, err := loadGame2048Config(state)
	if err != nil {
		return game2048RedeemPreviewResponse{}, err
	}
	player, err := loadGame2048Player(state, address)
	if err != nil {
		return game2048RedeemPreviewResponse{}, err
	}
	shopPool, err := state.GetPool(game2048ShopPoolID)
	if err != nil {
		return game2048RedeemPreviewResponse{}, err
	}
	daoPool, err := state.GetPool(lib.DAOPoolID)
	if err != nil {
		return game2048RedeemPreviewResponse{}, err
	}
	treasury, err := loadGame2048Treasury(state)
	if err != nil {
		return game2048RedeemPreviewResponse{}, err
	}

	response := game2048RedeemPreviewResponse{
		Address:    hex.EncodeToString(address),
		BurnPoints: burnPoints,
	}

	if burnPoints < cfg.ShopMinRedeemPoints {
		response.Reason = fmt.Sprintf("Minimum redemption is %d points.", cfg.ShopMinRedeemPoints)
		return response, nil
	}
	if cfg.ShopRedeemStepPoints > 0 && burnPoints%cfg.ShopRedeemStepPoints != 0 {
		response.Reason = fmt.Sprintf("Redemption must be in %d-point steps.", cfg.ShopRedeemStepPoints)
		return response, nil
	}
	if player.ClassicPointsBalance < burnPoints {
		response.Reason = "Not enough classic points."
		return response, nil
	}

	payoutAmount := calculateGame2048RedeemPayout(burnPoints, cfg.ShopRedemptionRatePoints, cfg.ShopRedemptionRateCnpy)
	response.PayoutAmount = payoutAmount
	if payoutAmount == 0 {
		response.Reason = "Redemption payout would be zero."
		return response, nil
	}
	if treasury.ShopBalance < payoutAmount {
		response.Reason = "Shop treasury is temporarily out of funds."
		return response, nil
	}
	if shopPool.Amount < payoutAmount && daoPool.Amount < payoutAmount {
		response.Reason = "Treasury is temporarily out of funds."
		return response, nil
	}

	response.Valid = true
	return response, nil
}

func loadGame2048Redemptions(state *fsm.StateMachine, address []byte) (game2048RedemptionHistoryResponse, lib.ErrorI) {
	response := game2048RedemptionHistoryResponse{
		Address:     hex.EncodeToString(address),
		Redemptions: make([]game2048RedemptionHistoryEntry, 0),
	}

	iterator, err := state.Iterator(keyForClassicPointRedemptionPrefix(address))
	if err != nil {
		return response, err
	}
	defer iterator.Close()

	for iterator.Valid() {
		message, decodeErr := decodeGame2048State("ClassicPointRedemption", iterator.Value())
		if decodeErr != nil {
			return response, decodeErr
		}
		redeemedAtUnix := uint64Field(message, "redeemed_at_unix", 0)
		response.Redemptions = append(response.Redemptions, game2048RedemptionHistoryEntry{
			BurnPoints:     uint64Field(message, "burn_points", 0),
			PayoutAmount:   uint64Field(message, "payout_amount", 0),
			RedeemedAtUnix: redeemedAtUnix,
			RedeemedAt:     unixMicrosToISO(redeemedAtUnix),
		})
		iterator.Next()
	}

	sort.Slice(response.Redemptions, func(i, j int) bool {
		return response.Redemptions[i].RedeemedAtUnix > response.Redemptions[j].RedeemedAtUnix
	})

	return response, nil
}

func loadGame2048Player(state *fsm.StateMachine, address []byte) (game2048PlayerResponse, lib.ErrorI) {
	account, err := state.GetAccount(crypto.NewAddress(address))
	if err != nil {
		return game2048PlayerResponse{}, err
	}

	bz, stateErr := state.Get(keyForPlayerStats(address))
	if stateErr != nil {
		return game2048PlayerResponse{}, stateErr
	}
	if len(bz) == 0 {
		return game2048PlayerResponse{
			Address: hex.EncodeToString(address),
			Balance: account.Amount,
		}, nil
	}

	message, decodeErr := decodeGame2048State("PlayerStats", bz)
	if decodeErr != nil {
		return game2048PlayerResponse{}, decodeErr
	}

	return game2048PlayerResponse{
		Address:              hex.EncodeToString(address),
		Balance:              account.Amount,
		DailyGamesStarted:    uint64Field(message, "daily_games_started", 0),
		ClassicGamesStarted:  uint64Field(message, "classic_games_started", 0),
		GamesCompleted:       uint64Field(message, "games_completed", 0),
		Wins:                 uint64Field(message, "wins", 0),
		Losses:               uint64Field(message, "losses", 0),
		BestDailyScore:       uint64Field(message, "best_daily_score", 0),
		BestClassicScore:     uint64Field(message, "best_classic_score", 0),
		BestTile:             uint64Field(message, "best_tile", 0),
		TotalScore:           uint64Field(message, "total_score", 0),
		ClassicPointsBalance: uint64Field(message, "classic_points_balance", 0),
		ClassicPointsEarned:  uint64Field(message, "classic_points_earned", 0),
		LoginStreak:          uint64Field(message, "login_streak", 0),
		LastLoginClaimUTCDate: stringField(message, "last_login_claim_utc_date", ""),
		ClassicPointsBonusUTCDate: stringField(message, "classic_points_bonus_utc_date", ""),
	}, nil
}

func loadGame2048Leaderboards(state *fsm.StateMachine) (game2048LeaderboardsResponse, lib.ErrorI) {
	daily, err := readLeaderboardPrefix(state, keyForDailyLeaderboardPrefix(currentUTCDate()), "daily", currentUTCDate())
	if err != nil {
		return game2048LeaderboardsResponse{}, err
	}
	classic, err := readLeaderboardPrefix(state, keyForClassicLeaderboardPrefix(), "classic", "")
	if err != nil {
		return game2048LeaderboardsResponse{}, err
	}
	return game2048LeaderboardsResponse{Daily: daily, Classic: classic}, nil
}

func readLeaderboardPrefix(
	state *fsm.StateMachine,
	prefix []byte,
	mode string,
	utcDate string,
) ([]game2048LeaderboardEntryResponse, lib.ErrorI) {
	iterator, err := state.Iterator(prefix)
	if err != nil {
		return nil, err
	}
	defer iterator.Close()

	results := make([]game2048LeaderboardEntryResponse, 0, game2048LeaderboardLimit)
	for iterator.Valid() && len(results) < game2048LeaderboardLimit {
		message, decodeErr := decodeGame2048State("LeaderboardEntry", iterator.Value())
		if decodeErr != nil {
			return nil, decodeErr
		}
		results = append(results, game2048LeaderboardEntryResponse{
			GameID:    hex.EncodeToString(bytesField(message, "game_id")),
			Address:   hex.EncodeToString(bytesField(message, "player_address")),
			Score:     uint64Field(message, "score", 0),
			MaxTile:   uint64Field(message, "max_tile", 0),
			MoveCount: uint64Field(message, "move_count", 0),
			Mode:      mode,
			UTCDate:   utcDate,
			EndedAt:   unixMicrosToISO(uint64Field(message, "ended_at_unix", 0)),
		})
		iterator.Next()
	}
	return results, nil
}

func deriveGame2048Session(
	tx lib.TransactionI,
	gameID []byte,
	address []byte,
	mode uint64,
	utcDate string,
	chainID uint64,
	cfg game2048ConfigResponse,
) (game2048SessionResponse, lib.ErrorI) {
	transaction, ok := tx.(*lib.Transaction)
	if !ok {
		return game2048SessionResponse{}, fsm.ErrInvalidTxMessage()
	}

	session := game2048SessionResponse{
		GameID:   hex.EncodeToString(gameID),
		Mode:     "classic",
		Seed:     hex.EncodeToString(deriveClassicSeed(address, transaction)),
		UTCDate:  "",
		MaxMoves: 0,
	}

	if mode == game2048ModeDaily {
		session.Mode = "daily"
		session.Seed = hex.EncodeToString(deriveDailySeed(chainID, utcDate))
		session.UTCDate = utcDate
		session.MaxMoves = cfg.DailyMaxMoves
	}

	return session, nil
}

func defaultGame2048Config() game2048ConfigResponse {
	return game2048ConfigResponse{
		DailyFee:                 game2048DefaultDailyFee,
		ClassicFee:               game2048DefaultClassicFee,
		DailyMaxMoves:            game2048DefaultDailyMoves,
		DailyPlatformFeeBps:      game2048DefaultDailyPlatformFeeBps,
		DailyRewardFeeBps:        game2048DefaultDailyRewardFeeBps,
		DailyReserveFeeBps:       game2048DefaultDailyReserveFeeBps,
		DailyShopFeeBps:          game2048DefaultDailyShopFeeBps,
		ClassicPlatformFeeBps:    game2048DefaultClassicPlatformFeeBps,
		ClassicReserveFeeBps:     game2048DefaultClassicReserveFeeBps,
		ClassicShopFeeBps:        game2048DefaultClassicShopFeeBps,
		DailyPayoutBps:           defaultDailyPayoutBps(),
		ClassicDailyPointsCap:    game2048DefaultClassicDailyPointsCap,
		ShopRedemptionRatePoints: game2048DefaultShopRedemptionRatePoints,
		ShopRedemptionRateCnpy:   game2048DefaultShopRedemptionRateCnpy,
		ShopMinRedeemPoints:      game2048DefaultShopMinRedeemPoints,
		ShopRedeemStepPoints:     game2048DefaultShopRedeemStepPoints,
		DailyLoginRewardPoints:   defaultDailyLoginRewardPoints(),
		DailyLoginBonusBps:       game2048DefaultDailyLoginBonusBps,
	}
}

func calculateGame2048RedeemPayout(burnPoints, ratePoints, rateCnpy uint64) uint64 {
	if burnPoints == 0 || ratePoints == 0 || rateCnpy == 0 {
		return 0
	}
	return (burnPoints * rateCnpy) / ratePoints
}

func currentUTCDate() string {
	return time.Now().UTC().Format("2006-01-02")
}

func keyForGameConfig() []byte {
	return lib.JoinLenPrefix(game2048Prefix, []byte("config"))
}

func keyForGameTreasury() []byte {
	return lib.JoinLenPrefix(game2048Prefix, []byte("treasury"))
}

func keyForPlayerStats(address []byte) []byte {
	return lib.JoinLenPrefix(game2048Prefix, []byte("player-stats"), address)
}

func keyForClassicPointsDailyLedger(utcDate string, address []byte) []byte {
	return lib.JoinLenPrefix(game2048Prefix, []byte("classic-points-day"), []byte(utcDate), address)
}

func keyForClassicPointRedemptionPrefix(address []byte) []byte {
	return lib.JoinLenPrefix(game2048Prefix, []byte("classic-redeem"), address)
}

func keyForDailyAttempt(utcDate string, address []byte) []byte {
	return lib.JoinLenPrefix(game2048Prefix, []byte("daily-attempt"), []byte(utcDate), address)
}

func keyForDailySubmissionPrefix() []byte {
	return lib.JoinLenPrefix(game2048Prefix, []byte("daily-submit"))
}

func keyForDailyLeaderboardPrefix(utcDate string) []byte {
	return lib.JoinLenPrefix(game2048Prefix, []byte("daily-leaderboard"), []byte(utcDate))
}

func keyForDailyPrizePool(utcDate string) []byte {
	return lib.JoinLenPrefix(game2048Prefix, []byte("daily-pool"), []byte(utcDate))
}

func keyForDailyRewardByPlayerPrefix(address []byte) []byte {
	return lib.JoinLenPrefix(game2048Prefix, []byte("daily-reward-player"), address)
}

func keyForDailyRewardClaim(utcDate string, address []byte) []byte {
	return lib.JoinLenPrefix(game2048Prefix, []byte("daily-claim"), []byte(utcDate), address)
}

func keyForClassicLeaderboardPrefix() []byte {
	return lib.JoinLenPrefix(game2048Prefix, []byte("classic-leaderboard"))
}

func defaultDailyPayoutBps() []uint64 {
	return []uint64{3000, 2000, 1200, 900, 700, 600, 500, 400, 400, 300}
}

func defaultDailyLoginRewardPoints() []uint64 {
	return []uint64{20, 25, 30, 35, 40, 45, 50}
}

func formatUint64(u uint64) []byte {
	buffer := make([]byte, 8)
	binary.BigEndian.PutUint64(buffer, u)
	return buffer
}

func deriveGameID(address []byte, tx *lib.Transaction, mode uint64) []byte {
	salt := "classic"
	if mode == game2048ModeDaily {
		salt = currentUTCDate()
	}
	publicKey := []byte{}
	signature := []byte{}
	if tx != nil && tx.Signature != nil {
		publicKey = tx.Signature.PublicKey
		signature = tx.Signature.Signature
	}
	return sha256Bytes(
		[]byte("game-id"),
		address,
		[]byte(salt),
		formatUint64(tx.CreatedHeight),
		formatUint64(tx.Time),
		formatUint64(tx.Fee),
		[]byte(tx.Memo),
		publicKey,
		signature,
	)
}

func deriveDailySeed(chainID uint64, utcDate string) []byte {
	return sha256Bytes([]byte("daily-seed"), []byte(strconv.FormatUint(chainID, 10)), []byte(utcDate))
}

func deriveClassicSeed(address []byte, tx *lib.Transaction) []byte {
	return sha256Bytes(
		[]byte("classic-seed"),
		address,
		[]byte(strconv.FormatUint(tx.CreatedHeight, 10)),
		[]byte(strconv.FormatUint(tx.Time, 10)),
		[]byte(strconv.FormatUint(tx.Fee, 10)),
		[]byte(tx.Memo),
	)
}

func sha256Bytes(parts ...[]byte) []byte {
	hash := sha256.New()
	for _, part := range parts {
		hash.Write(part)
		hash.Write([]byte{0})
	}
	return hash.Sum(nil)
}

func unixMicrosToISO(value uint64) string {
	if value == 0 {
		return ""
	}
	return time.UnixMicro(int64(value)).UTC().Format(time.RFC3339)
}

func game2048AnyMessage(
	messageName string,
	populate func(message protoreflect.Message),
) (*anypb.Any, lib.ErrorI) {
	descriptor, err := game2048MessageDescriptor(messageName)
	if err != nil {
		return nil, err
	}
	message := dynamicpb.NewMessage(descriptor)
	populate(message)
	anyMessage, marshalErr := anypb.New(message)
	if marshalErr != nil {
		return nil, lib.ErrToAny(marshalErr)
	}
	return anyMessage, nil
}

func decodeGame2048State(messageName string, bz []byte) (protoreflect.Message, lib.ErrorI) {
	descriptor, err := game2048MessageDescriptor(messageName)
	if err != nil {
		return nil, err
	}
	message := dynamicpb.NewMessage(descriptor)
	if unmarshalErr := proto.Unmarshal(bz, message); unmarshalErr != nil {
		return nil, lib.ErrUnmarshal(unmarshalErr)
	}
	return message, nil
}

func game2048MessageDescriptor(messageName string) (protoreflect.MessageDescriptor, lib.ErrorI) {
	fileDescriptor, err := game2048FileDescriptor()
	if err != nil {
		return nil, err
	}
	message := fileDescriptor.Messages().ByName(protoreflect.Name(messageName))
	if message == nil {
		return nil, lib.ErrInvalidPluginSchema(fmt.Errorf("message %s not found", messageName))
	}
	return message, nil
}

func game2048FileDescriptor() (protoreflect.FileDescriptor, lib.ErrorI) {
	if game2048DescriptorFile != nil {
		return game2048DescriptorFile, nil
	}
	if game2048DescriptorErr != nil {
		return nil, lib.ErrInvalidPluginSchema(game2048DescriptorErr)
	}

	fileProto := &descriptorpb.FileDescriptorProto{
		Syntax:  proto.String("proto3"),
		Name:    proto.String("game2048.proto"),
		Package: proto.String("types"),
		EnumType: []*descriptorpb.EnumDescriptorProto{
			enumDescriptor("GameMode", []game2048EnumValue{
				{Name: "GAME_MODE_UNSPECIFIED", Number: 0},
				{Name: "GAME_MODE_DAILY", Number: 1},
				{Name: "GAME_MODE_CLASSIC", Number: 2},
			}),
			enumDescriptor("SessionStatus", []game2048EnumValue{
				{Name: "SESSION_STATUS_UNSPECIFIED", Number: 0},
				{Name: "SESSION_STATUS_ACTIVE", Number: 1},
				{Name: "SESSION_STATUS_COMPLETED", Number: 2},
				{Name: "SESSION_STATUS_EXPIRED", Number: 3},
			}),
			enumDescriptor("StopReason", []game2048EnumValue{
				{Name: "STOP_REASON_UNSPECIFIED", Number: 0},
				{Name: "STOP_REASON_PLAYER_STOPPED", Number: 1},
				{Name: "STOP_REASON_NO_MOVES", Number: 2},
				{Name: "STOP_REASON_MAX_MOVES", Number: 3},
			}),
			enumDescriptor("MoveDirection", []game2048EnumValue{
				{Name: "MOVE_DIRECTION_UNSPECIFIED", Number: 0},
				{Name: "MOVE_DIRECTION_UP", Number: 1},
				{Name: "MOVE_DIRECTION_RIGHT", Number: 2},
				{Name: "MOVE_DIRECTION_DOWN", Number: 3},
				{Name: "MOVE_DIRECTION_LEFT", Number: 4},
			}),
		},
		MessageType: []*descriptorpb.DescriptorProto{
			messageDescriptor("MessageStartDailyGame", []*descriptorpb.FieldDescriptorProto{
				bytesFieldDescriptor("player_address", 1),
				stringFieldDescriptor("utc_date", 2),
				bytesFieldDescriptor("game_id", 3),
			}),
			messageDescriptor("MessageStartClassicGame", []*descriptorpb.FieldDescriptorProto{
				bytesFieldDescriptor("player_address", 1),
				bytesFieldDescriptor("game_id", 2),
			}),
			messageDescriptor("MessageSubmitGameResult", []*descriptorpb.FieldDescriptorProto{
				bytesFieldDescriptor("player_address", 1),
				bytesFieldDescriptor("game_id", 2),
				enumFieldDescriptor("moves", 3, ".types.MoveDirection", true),
				uint64FieldDescriptor("declared_score", 4),
				uint64FieldDescriptor("declared_max_tile", 5),
				enumFieldDescriptor("stop_reason", 6, ".types.StopReason", false),
			}),
			messageDescriptor("MessageClaimDailyReward", []*descriptorpb.FieldDescriptorProto{
				bytesFieldDescriptor("player_address", 1),
				stringFieldDescriptor("utc_date", 2),
			}),
			messageDescriptor("MessageRedeemClassicPoints", []*descriptorpb.FieldDescriptorProto{
				bytesFieldDescriptor("player_address", 1),
				uint64FieldDescriptor("burn_points", 2),
			}),
			messageDescriptor("MessageClaimDailyLoginReward", []*descriptorpb.FieldDescriptorProto{
				bytesFieldDescriptor("player_address", 1),
			}),
			messageDescriptor("GameConfig", []*descriptorpb.FieldDescriptorProto{
				uint64FieldDescriptor("classic_start_fee", 1),
				uint64FieldDescriptor("daily_start_fee", 2),
				uint64FieldDescriptor("daily_max_moves", 3),
				uint64FieldDescriptor("classic_leaderboard_size", 4),
				uint64FieldDescriptor("daily_leaderboard_size", 5),
				bytesFieldDescriptor("platform_treasury_address", 6),
				uint64FieldDescriptor("daily_platform_fee_bps", 7),
				uint64FieldDescriptor("daily_payout_bps", 8, true),
				uint64FieldDescriptor("classic_daily_points_cap", 9),
				uint64FieldDescriptor("shop_redemption_rate_points", 10),
				uint64FieldDescriptor("shop_redemption_rate_cnpy", 11),
				uint64FieldDescriptor("shop_min_redeem_points", 12),
				uint64FieldDescriptor("shop_redeem_step_points", 13),
				uint64FieldDescriptor("daily_reward_fee_bps", 14),
				uint64FieldDescriptor("daily_reserve_fee_bps", 15),
				uint64FieldDescriptor("daily_shop_fee_bps", 16),
				uint64FieldDescriptor("classic_platform_fee_bps", 17),
				uint64FieldDescriptor("classic_reserve_fee_bps", 18),
				uint64FieldDescriptor("classic_shop_fee_bps", 19),
				uint64FieldDescriptor("daily_login_reward_points", 20, true),
				uint64FieldDescriptor("daily_login_bonus_bps", 21),
			}),
			messageDescriptor("GameSession", []*descriptorpb.FieldDescriptorProto{
				bytesFieldDescriptor("game_id", 1),
				bytesFieldDescriptor("player_address", 2),
				enumFieldDescriptor("mode", 3, ".types.GameMode", false),
				stringFieldDescriptor("utc_date", 4),
				bytesFieldDescriptor("seed", 5),
				enumFieldDescriptor("status", 6, ".types.SessionStatus", false),
				uint64FieldDescriptor("started_height", 7),
				uint64FieldDescriptor("started_at_unix", 8),
				uint64FieldDescriptor("fee_paid", 9),
				uint64FieldDescriptor("max_moves", 10),
				uint64FieldDescriptor("submitted_score", 11),
				uint64FieldDescriptor("submitted_max_tile", 12),
				uint64FieldDescriptor("final_move_count", 13),
				enumFieldDescriptor("stop_reason", 14, ".types.StopReason", false),
				uint64FieldDescriptor("submitted_at_unix", 15),
			}),
			messageDescriptor("DailyAttempt", []*descriptorpb.FieldDescriptorProto{
				stringFieldDescriptor("utc_date", 1),
				bytesFieldDescriptor("player_address", 2),
				bytesFieldDescriptor("game_id", 3),
			}),
			messageDescriptor("DailySubmission", []*descriptorpb.FieldDescriptorProto{
				stringFieldDescriptor("utc_date", 1),
				bytesFieldDescriptor("player_address", 2),
				bytesFieldDescriptor("game_id", 3),
				uint64FieldDescriptor("score", 4),
				uint64FieldDescriptor("max_tile", 5),
				uint64FieldDescriptor("move_count", 6),
				uint64FieldDescriptor("submitted_at_unix", 7),
			}),
			messageDescriptor("DailyPrizePool", []*descriptorpb.FieldDescriptorProto{
				stringFieldDescriptor("utc_date", 1),
				uint64FieldDescriptor("entry_count", 2),
				uint64FieldDescriptor("gross_fees", 3),
				uint64FieldDescriptor("treasury_fees", 4),
				uint64FieldDescriptor("reward_pool", 5),
				boolFieldDescriptor("finalized", 6),
				uint64FieldDescriptor("finalized_at_unix", 7),
				uint64FieldDescriptor("distributed_rewards", 8),
				uint64FieldDescriptor("treasury_leftover", 9),
			}),
			messageDescriptor("GameTreasury", []*descriptorpb.FieldDescriptorProto{
				uint64FieldDescriptor("platform_balance", 1),
				uint64FieldDescriptor("reserve_balance", 2),
				uint64FieldDescriptor("shop_balance", 3),
				uint64FieldDescriptor("updated_at_unix", 4),
			}),
			messageDescriptor("LeaderboardEntry", []*descriptorpb.FieldDescriptorProto{
				bytesFieldDescriptor("game_id", 1),
				bytesFieldDescriptor("player_address", 2),
				uint64FieldDescriptor("score", 3),
				uint64FieldDescriptor("max_tile", 4),
				uint64FieldDescriptor("move_count", 5),
				uint64FieldDescriptor("ended_at_unix", 6),
			}),
			messageDescriptor("DailyRewardAllocation", []*descriptorpb.FieldDescriptorProto{
				stringFieldDescriptor("utc_date", 1),
				bytesFieldDescriptor("player_address", 2),
				bytesFieldDescriptor("game_id", 3),
				uint64FieldDescriptor("rank", 4),
				uint64FieldDescriptor("reward_amount", 5),
				uint64FieldDescriptor("score", 6),
				uint64FieldDescriptor("max_tile", 7),
				uint64FieldDescriptor("move_count", 8),
				uint64FieldDescriptor("ended_at_unix", 9),
			}),
			messageDescriptor("DailyRewardClaim", []*descriptorpb.FieldDescriptorProto{
				stringFieldDescriptor("utc_date", 1),
				bytesFieldDescriptor("player_address", 2),
				bytesFieldDescriptor("game_id", 3),
				uint64FieldDescriptor("rank", 4),
				uint64FieldDescriptor("claimed_amount", 5),
				uint64FieldDescriptor("claimed_at_unix", 6),
			}),
			messageDescriptor("ClassicPointsDailyLedger", []*descriptorpb.FieldDescriptorProto{
				stringFieldDescriptor("utc_date", 1),
				bytesFieldDescriptor("player_address", 2),
				uint64FieldDescriptor("earned_points", 3),
			}),
			messageDescriptor("ClassicPointRedemption", []*descriptorpb.FieldDescriptorProto{
				bytesFieldDescriptor("player_address", 1),
				uint64FieldDescriptor("burn_points", 2),
				uint64FieldDescriptor("payout_amount", 3),
				uint64FieldDescriptor("redeemed_at_unix", 4),
			}),
			messageDescriptor("DailyLoginClaim", []*descriptorpb.FieldDescriptorProto{
				stringFieldDescriptor("utc_date", 1),
				bytesFieldDescriptor("player_address", 2),
				uint64FieldDescriptor("streak_day", 3),
				uint64FieldDescriptor("reward_points", 4),
				uint64FieldDescriptor("bonus_bps", 5),
				uint64FieldDescriptor("claimed_at_unix", 6),
			}),
			messageDescriptor("PlayerStats", []*descriptorpb.FieldDescriptorProto{
				bytesFieldDescriptor("player_address", 1),
				uint64FieldDescriptor("daily_games_started", 2),
				uint64FieldDescriptor("classic_games_started", 3),
				uint64FieldDescriptor("games_completed", 4),
				uint64FieldDescriptor("wins", 5),
				uint64FieldDescriptor("losses", 6),
				uint64FieldDescriptor("best_daily_score", 7),
				uint64FieldDescriptor("best_classic_score", 8),
				uint64FieldDescriptor("best_tile", 9),
				uint64FieldDescriptor("total_score", 10),
				uint64FieldDescriptor("classic_points_balance", 11),
				uint64FieldDescriptor("classic_points_earned", 12),
				uint64FieldDescriptor("login_streak", 13),
				stringFieldDescriptor("last_login_claim_utc_date", 14),
				stringFieldDescriptor("classic_points_bonus_utc_date", 15),
			}),
		},
	}

	game2048DescriptorFile, game2048DescriptorErr = protodesc.NewFile(fileProto, nil)
	if game2048DescriptorErr != nil {
		return nil, lib.ErrInvalidPluginSchema(game2048DescriptorErr)
	}
	return game2048DescriptorFile, nil
}

func messageDescriptor(name string, fields []*descriptorpb.FieldDescriptorProto) *descriptorpb.DescriptorProto {
	return &descriptorpb.DescriptorProto{
		Name:  proto.String(name),
		Field: fields,
	}
}

func enumDescriptor(name string, values []game2048EnumValue) *descriptorpb.EnumDescriptorProto {
	enumValues := make([]*descriptorpb.EnumValueDescriptorProto, 0, len(values))
	for _, value := range values {
		enumValues = append(enumValues, &descriptorpb.EnumValueDescriptorProto{
			Name:   proto.String(value.Name),
			Number: proto.Int32(value.Number),
		})
	}
	return &descriptorpb.EnumDescriptorProto{
		Name:  proto.String(name),
		Value: enumValues,
	}
}

func bytesFieldDescriptor(name string, number int32) *descriptorpb.FieldDescriptorProto {
	return &descriptorpb.FieldDescriptorProto{
		Name:   proto.String(name),
		Number: proto.Int32(number),
		Label:  descriptorpb.FieldDescriptorProto_LABEL_OPTIONAL.Enum(),
		Type:   descriptorpb.FieldDescriptorProto_TYPE_BYTES.Enum(),
	}
}

func stringFieldDescriptor(name string, number int32) *descriptorpb.FieldDescriptorProto {
	return &descriptorpb.FieldDescriptorProto{
		Name:   proto.String(name),
		Number: proto.Int32(number),
		Label:  descriptorpb.FieldDescriptorProto_LABEL_OPTIONAL.Enum(),
		Type:   descriptorpb.FieldDescriptorProto_TYPE_STRING.Enum(),
	}
}

func uint64FieldDescriptor(name string, number int32, repeated ...bool) *descriptorpb.FieldDescriptorProto {
	label := descriptorpb.FieldDescriptorProto_LABEL_OPTIONAL
	if len(repeated) > 0 && repeated[0] {
		label = descriptorpb.FieldDescriptorProto_LABEL_REPEATED
	}
	return &descriptorpb.FieldDescriptorProto{
		Name:   proto.String(name),
		Number: proto.Int32(number),
		Label:  label.Enum(),
		Type:   descriptorpb.FieldDescriptorProto_TYPE_UINT64.Enum(),
	}
}

func boolFieldDescriptor(name string, number int32) *descriptorpb.FieldDescriptorProto {
	return &descriptorpb.FieldDescriptorProto{
		Name:   proto.String(name),
		Number: proto.Int32(number),
		Label:  descriptorpb.FieldDescriptorProto_LABEL_OPTIONAL.Enum(),
		Type:   descriptorpb.FieldDescriptorProto_TYPE_BOOL.Enum(),
	}
}

func enumFieldDescriptor(name string, number int32, typeName string, repeated bool) *descriptorpb.FieldDescriptorProto {
	label := descriptorpb.FieldDescriptorProto_LABEL_OPTIONAL
	if repeated {
		label = descriptorpb.FieldDescriptorProto_LABEL_REPEATED
	}
	return &descriptorpb.FieldDescriptorProto{
		Name:     proto.String(name),
		Number:   proto.Int32(number),
		Label:    label.Enum(),
		Type:     descriptorpb.FieldDescriptorProto_TYPE_ENUM.Enum(),
		TypeName: proto.String(typeName),
	}
}

func setBytesField(message protoreflect.Message, fieldName string, value []byte) {
	field := message.Descriptor().Fields().ByName(protoreflect.Name(fieldName))
	message.Set(field, protoreflect.ValueOfBytes(value))
}

func setStringField(message protoreflect.Message, fieldName, value string) {
	field := message.Descriptor().Fields().ByName(protoreflect.Name(fieldName))
	message.Set(field, protoreflect.ValueOfString(value))
}

func setUint64Field(message protoreflect.Message, fieldName string, value uint64) {
	field := message.Descriptor().Fields().ByName(protoreflect.Name(fieldName))
	message.Set(field, protoreflect.ValueOfUint64(value))
}

func setEnumField(message protoreflect.Message, fieldName string, value uint64) {
	field := message.Descriptor().Fields().ByName(protoreflect.Name(fieldName))
	message.Set(field, protoreflect.ValueOfEnum(protoreflect.EnumNumber(value)))
}

func appendEnumListField(message protoreflect.Message, fieldName string, values []uint64) {
	field := message.Descriptor().Fields().ByName(protoreflect.Name(fieldName))
	list := message.Mutable(field).List()
	for _, value := range values {
		list.Append(protoreflect.ValueOfEnum(protoreflect.EnumNumber(value)))
	}
}

func uint64Field(message protoreflect.Message, fieldName string, fallback uint64) uint64 {
	field := message.Descriptor().Fields().ByName(protoreflect.Name(fieldName))
	if field == nil || !message.Has(field) {
		return fallback
	}
	return message.Get(field).Uint()
}

func bytesField(message protoreflect.Message, fieldName string) []byte {
	field := message.Descriptor().Fields().ByName(protoreflect.Name(fieldName))
	if field == nil || !message.Has(field) {
		return nil
	}
	return message.Get(field).Bytes()
}

func stringField(message protoreflect.Message, fieldName string, fallback string) string {
	field := message.Descriptor().Fields().ByName(protoreflect.Name(fieldName))
	if field == nil || !message.Has(field) {
		return fallback
	}
	return message.Get(field).String()
}

func boolField(message protoreflect.Message, fieldName string) bool {
	field := message.Descriptor().Fields().ByName(protoreflect.Name(fieldName))
	if field == nil || !message.Has(field) {
		return false
	}
	return message.Get(field).Bool()
}

func uint64ListField(message protoreflect.Message, fieldName string, fallback []uint64) []uint64 {
	field := message.Descriptor().Fields().ByName(protoreflect.Name(fieldName))
	if field == nil || !message.Has(field) {
		return fallback
	}
	list := message.Get(field).List()
	values := make([]uint64, 0, list.Len())
	for i := 0; i < list.Len(); i++ {
		values = append(values, list.Get(i).Uint())
	}
	if len(values) == 0 {
		return fallback
	}
	return values
}
