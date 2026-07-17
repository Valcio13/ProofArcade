package rpc

import (
	"net/http"
	"net/http/pprof"

	"github.com/julienschmidt/httprouter"
)

// Canopy RPC Paths
const (
	VersionRoutePath                   = "/v1/"
	TxRoutePath                        = "/v1/tx"
	TxsRoutePath                       = "/v1/txs"
	HeightRoutePath                    = "/v1/query/height"
	IndexerBlobsRoutePath              = "/v1/query/indexer-blobs"
	AccountRoutePath                   = "/v1/query/account"
	AccountsRoutePath                  = "/v1/query/accounts"
	PoolRoutePath                      = "/v1/query/pool"
	PoolsRoutePath                     = "/v1/query/pools"
	ValidatorRoutePath                 = "/v1/query/validator"
	ValidatorsRoutePath                = "/v1/query/validators"
	CommitteeDataRoutePath             = "/v1/query/committee-data"
	CommitteesDataRoutePath            = "/v1/query/committees-data"
	SubsidizedCommitteesRoutePath      = "/v1/query/subsidized-committees"
	RetiredCommitteesRoutePath         = "/v1/query/retired-committees"
	NonSignersRoutePath                = "/v1/query/non-signers"
	ParamRoutePath                     = "/v1/query/params"
	SupplyRoutePath                    = "/v1/query/supply"
	FeeParamRoutePath                  = "/v1/query/fee-params"
	GovParamRoutePath                  = "/v1/query/gov-params"
	ConParamsRoutePath                 = "/v1/query/con-params"
	ValParamRoutePath                  = "/v1/query/val-params"
	EcoParamRoutePath                  = "/v1/query/eco-params"
	StateRoutePath                     = "/v1/query/state"
	StateDiffRoutePath                 = "/v1/query/state-diff"
	StateDiffGetRoutePath              = "/v1/query/state-diff"
	CertByHeightRoutePath              = "/v1/query/cert-by-height"
	BlockByHeightRoutePath             = "/v1/query/block-by-height"
	BlocksRoutePath                    = "/v1/query/blocks"
	BlockByHashRoutePath               = "/v1/query/block-by-hash"
	TxsByHeightRoutePath               = "/v1/query/txs-by-height"
	TxsBySenderRoutePath               = "/v1/query/txs-by-sender"
	TxsByRecRoutePath                  = "/v1/query/txs-by-rec"
	TxByHashRoutePath                  = "/v1/query/tx-by-hash"
	EventsByHeightRoutePath            = "/v1/query/events-by-height"
	EventsByAddressRoutePath           = "/v1/query/events-by-address"
	EventsByChainRoutePath             = "/v1/query/events-by-chain"
	OrderRoutePath                     = "/v1/query/order"
	OrdersRoutePath                    = "/v1/query/orders"
	DexPriceRoutePath                  = "/v1/query/dex-price"
	DexBatchRoutePath                  = "/v1/query/dex-batch"
	NextDexBatchRoutePath              = "/v1/query/next-dex-batch"
	LastProposersRoutePath             = "/v1/query/last-proposers"
	IsValidDoubleSignerRoutePath       = "/v1/query/valid-double-signer"
	DoubleSignersRoutePath             = "/v1/query/double-signers"
	MinimumEvidenceHeightRoutePath     = "/v1/query/minimum-evidence-height"
	LotteryRoutePath                   = "/v1/query/lottery"
	PendingRoutePath                   = "/v1/query/pending"
	FailedTxRoutePath                  = "/v1/query/failed-txs"
	ProposalsRoutePath                 = "/v1/gov/proposals"
	PollRoutePath                      = "/v1/gov/poll"
	RootChainInfoRoutePath             = "/v1/query/root-chain-info"
	ValidatorSetRoutePath              = "/v1/query/validator-set"
	CheckpointRoutePath                = "/v1/query/checkpoint"
	Game2048ConfigRoutePath            = "/v1/query/2048/config"
	Game2048PlayerRoutePath            = "/v1/query/2048/player"
	Game2048LeaderboardsRoutePath      = "/v1/query/2048/leaderboards"
	Game2048DailyPoolRoutePath         = "/v1/query/2048/daily-pool"
	Game2048TreasuryRoutePath          = "/v1/query/2048/treasury"
	Game2048MonthlyLeaderboardRoutePath = "/v1/query/2048/monthly-leaderboard/:monthId"
	Game2048MonthlyPoolRoutePath       = "/v1/query/2048/monthly-pool"
	Game2048ClaimableRewardsPath       = "/v1/query/2048/claimable-rewards"
	Game2048ShopConfigRoutePath        = "/v1/query/2048/shop-config"
	Game2048RedeemPreviewRoutePath     = "/v1/query/2048/redeem-preview"
	Game2048RedemptionsRoutePath       = "/v1/query/2048/redemptions"
	Game2048GameHistoryRoutePath       = "/v1/query/2048/game-history"
	Game2048UsernameRoutePath          = "/v1/query/2048/username"
	Game2048AddressByUsernameRoutePath = "/v1/query/2048/address-by-username"
	Game2048WeeklyBlitzCurrentRoutePath = "/v1/query/2048/weekly-blitz/current"
	Game2048WeeklyBlitzWeekRoutePath    = "/v1/query/2048/weekly-blitz/:weekId"
	Game2048WeeklyBlitzLeaderboardRoutePath = "/v1/query/2048/weekly-blitz/:weekId/leaderboard"
	Game2048WeeklyBlitzPlayerStatusRoutePath = "/v1/query/2048/weekly-blitz/player/:address/status"
	SubscribeRCInfoPath                = "/v1/subscribe-rc-info"
	// eth
	EthereumRoutePath = "/v1/eth"
	// admin
	KeystoreRoutePath            = "/v1/admin/keystore"
	KeystoreNewKeyRoutePath      = "/v1/admin/keystore-new-key"
	KeystoreImportRoutePath      = "/v1/admin/keystore-import"
	KeystoreImportRawRoutePath   = "/v1/admin/keystore-import-raw"
	KeystoreDeleteRoutePath      = "/v1/admin/keystore-delete"
	KeystoreGetRoutePath         = "/v1/admin/keystore-get"
	WalletVerifyRoutePath        = "/v1/admin/wallet-verify"
	TxSendRoutePath              = "/v1/admin/tx-send"
	TxSendVestingRoutePath       = "/v1/admin/tx-send-vesting"
	TxStakeRoutePath             = "/v1/admin/tx-stake"
	TxEditStakeRoutePath         = "/v1/admin/tx-edit-stake"
	TxUnstakeRoutePath           = "/v1/admin/tx-unstake"
	TxPauseRoutePath             = "/v1/admin/tx-pause"
	TxUnpauseRoutePath           = "/v1/admin/tx-unpause"
	TxChangeParamRoutePath       = "/v1/admin/tx-change-param"
	TxDAOTransferRoutePath       = "/v1/admin/tx-dao-transfer"
	TxCreateOrderRoutePath       = "/v1/admin/tx-create-order"
	TxEditOrderRoutePath         = "/v1/admin/tx-edit-order"
	TxDeleteOrderRoutePath       = "/v1/admin/tx-delete-order"
	TxDexLimitOrderPath          = "/v1/admin/tx-dex-limit-order"
	TxDexLiquidityDepositPath    = "/v1/admin/tx-dex-liquidity-deposit"
	TxDexLiquidityWithdrawPath   = "/v1/admin/tx-dex-liquidity-withdraw"
	TxLockOrderRoutePath         = "/v1/admin/tx-lock-order"
	TxCloseOrderRoutePath        = "/v1/admin/tx-close-order"
	TxSubsidyRoutePath           = "/v1/admin/tx-subsidy"
	TxStartPollRoutePath         = "/v1/admin/tx-start-poll"
	TxVotePollRoutePath          = "/v1/admin/tx-vote-poll"
	ResourceUsageRoutePath       = "/v1/admin/resource-usage"
	PeerInfoRoutePath            = "/v1/admin/peer-info"
	ConsensusInfoRoutePath       = "/v1/admin/consensus-info"
	PeerBookRoutePath            = "/v1/admin/peer-book"
	Tx2048StartDailyRoutePath    = "/v1/admin/tx-2048-start-daily"
	Tx2048StartClassicRoutePath  = "/v1/admin/tx-2048-start-classic"
	Tx2048StartWeeklyBlitzRoutePath = "/v1/admin/tx-2048-start-weekly-blitz"
	Tx2048SubmitRoutePath        = "/v1/admin/tx-2048-submit"
	Tx2048ClaimDailyRoutePath    = "/v1/admin/tx-2048-claim-daily-reward"
	Tx2048RedeemClassicRoutePath = "/v1/admin/tx-2048-redeem-classic-points"
	Tx2048ClaimLoginRoutePath    = "/v1/admin/tx-2048-claim-daily-login"
	Tx2048SetUsernameRoutePath   = "/v1/admin/tx-2048-set-username"
	DevFaucetRoutePath           = "/v1/admin/dev-faucet"
	ConfigRoutePath              = "/v1/admin/config"
	LogsRoutePath                = "/v1/admin/log"
	AddVoteRoutePath             = "/v1/gov/add-vote"
	DelVoteRoutePath             = "/v1/gov/del-vote"
	AdminVerifyRoutePath         = "/v1/admin/verify"
	AdminConfigRoutePath         = "/v1/admin/admin-config"
	AdminPoolTransferRoutePath   = "/v1/admin/pool-transfer"
	AdminPoolWithdrawalRoutePath = "/v1/admin/pool-withdrawal"
	AdminPoolDepositRoutePath    = "/v1/admin/pool-deposit"
	AdminBanPlayerRoutePath      = "/v1/admin/ban-player"
	AdminUnbanPlayerRoutePath    = "/v1/admin/unban-player"
	AdminValidatorAddressRoutePath = "/v1/admin/validator-address"
)

const (
	VersionRouteName                   = "version"
	TxRouteName                        = "tx"
	TxsRouteName                       = "txs"
	HeightRouteName                    = "height"
	IndexerBlobsRouteName              = "indexer-blobs"
	AccountRouteName                   = "account"
	AccountsRouteName                  = "accounts"
	PoolRouteName                      = "pool"
	PoolsRouteName                     = "pools"
	ValidatorRouteName                 = "validator"
	ValidatorsRouteName                = "validators"
	ValidatorSetRouteName              = "validator-set"
	CommitteeDataRouteName             = "committee-data"
	CommitteesDataRouteName            = "committees-data"
	SubsidizedCommitteesRouteName      = "subsidized-committees"
	RetiredCommitteesRouteName         = "retired-committees"
	NonSignersRouteName                = "non-signers"
	SupplyRouteName                    = "supply"
	ParamRouteName                     = "params"
	FeeParamRouteName                  = "fee-params"
	GovParamRouteName                  = "gov-params"
	ConParamsRouteName                 = "con-params"
	ValParamRouteName                  = "val-params"
	EcoParamRouteName                  = "eco-params"
	StateRouteName                     = "state"
	StateDiffRouteName                 = "state-diff"
	StateDiffGetRouteName              = "state-diff-get"
	CertByHeightRouteName              = "cert-by-height"
	BlocksRouteName                    = "blocks"
	BlockByHeightRouteName             = "block-by-height"
	BlockByHashRouteName               = "block-by-hash"
	TxsByHeightRouteName               = "txs-by-height"
	TxsBySenderRouteName               = "txs-by-sender"
	TxsByRecRouteName                  = "txs-by-rec"
	TxByHashRouteName                  = "tx-by-hash"
	EventsByHeightRouteName            = "events-by-height"
	EventsByAddressRouteName           = "events-by-address"
	EventsByChainRouteName             = "events-by-chain"
	PendingRouteName                   = "pending"
	FailedTxRouteName                  = "failed-txs"
	ProposalsRouteName                 = "proposals"
	PollRouteName                      = "poll"
	OrderRouteName                     = "order"
	OrdersRouteName                    = "orders"
	DexPriceRouteName                  = "dex-price"
	DexBatchRouteName                  = "dex-batch"
	NextDexBatchRouteName              = "next-dex-batch"
	LastProposersRouteName             = "last-proposers"
	IsValidDoubleSignerRouteName       = "valid-double-signer"
	DoubleSignersRouteName             = "double-signers"
	MinimumEvidenceHeightRouteName     = "minimum-evidence-height"
	LotteryRouteName                   = "lottery"
	RootChainInfoRouteName             = "root-chain-info"
	CheckpointRouteName                = "checkpoint"
	Game2048ConfigRouteName            = "2048-config"
	Game2048PlayerRouteName            = "2048-player"
	Game2048LeaderboardsRouteName      = "2048-leaderboards"
	Game2048DailyPoolRouteName         = "2048-daily-pool"
	Game2048TreasuryRouteName          = "2048-treasury"
	Game2048MonthlyLeaderboardRouteName = "2048-monthly-leaderboard"
	Game2048MonthlyPoolRouteName       = "2048-monthly-pool"
	Game2048ClaimableRewardsName       = "2048-claimable-rewards"
	Game2048ShopConfigRouteName        = "2048-shop-config"
	Game2048RedeemPreviewRouteName     = "2048-redeem-preview"
	Game2048RedemptionsRouteName       = "2048-redemptions"
	Game2048GameHistoryRouteName       = "2048-game-history"
	Game2048UsernameRouteName          = "2048-username"
	Game2048AddressByUsernameRouteName = "2048-address-by-username"
	Game2048WeeklyBlitzCurrentRouteName = "2048-weekly-blitz-current"
	Game2048WeeklyBlitzWeekRouteName    = "2048-weekly-blitz-week"
	Game2048WeeklyBlitzLeaderboardRouteName = "2048-weekly-blitz-leaderboard"
	Game2048WeeklyBlitzPlayerStatusRouteName = "2048-weekly-blitz-player-status"
	// debug
	DebugBlockedRouteName   = "blocked"
	DebugHeapRouteName      = "heap"
	DebugCPURouteName       = "cpu"
	DebugGoroutineRouteName = "goroutine"
	// eth
	EthereumRouteName = "eth"
	// admin
	KeystoreRouteName               = "keystore"
	KeystoreNewKeyRouteName         = "keystore-new-key"
	KeystoreImportRouteName         = "keystore-import"
	KeystoreImportRawRouteName      = "keystore-import-raw"
	KeystoreDeleteRouteName         = "keystore-delete"
	KeystoreGetRouteName            = "keystore-get"
	WalletVerifyRouteName           = "wallet-verify"
	TxSendRouteName                 = "tx-send"
	TxSendVestingRouteName          = "tx-send-vesting"
	TxStakeRouteName                = "tx-stake"
	TxUnstakeRouteName              = "tx-unstake"
	TxEditStakeRouteName            = "tx-edit-stake"
	TxPauseRouteName                = "tx-pause"
	TxUnpauseRouteName              = "tx-unpause"
	TxChangeParamRouteName          = "tx-change-param"
	TxDAOTransferRouteName          = "tx-dao-transfer"
	TxSubsidyRouteName              = "tx-subsidy"
	TxCreateOrderRouteName          = "tx-create-order"
	TxEditOrderRouteName            = "tx-edit-order"
	TxDeleteOrderRouteName          = "tx-delete-order"
	TxDexLimitOrderRouteName        = "tx-dex-limit-order"
	TxDexLiquidityDepositRouteName  = "tx-dex-liquidity-deposit"
	TxDexLiquidityWithdrawRouteName = "tx-dex-liquidity-withdraw"
	TxLockOrderRouteName            = "tx-lock-order"
	TxCloseOrderRouteName           = "tx-close-order"
	TxStartPollRouteName            = "tx-start-poll"
	TxVotePollRouteName             = "tx-vote-poll"
	ResourceUsageRouteName          = "resource-usage"
	PeerInfoRouteName               = "peer-info"
	ConsensusInfoRouteName          = "consensus-info"
	PeerBookRouteName               = "peer-book"
	Tx2048StartDailyRouteName       = "2048-start-daily"
	Tx2048StartClassicRouteName     = "2048-start-classic"
	Tx2048StartWeeklyBlitzRouteName = "2048-start-weekly-blitz"
	Tx2048SubmitRouteName           = "2048-submit"
	Tx2048ClaimDailyRouteName       = "2048-claim-daily-reward"
	Tx2048RedeemClassicRouteName    = "2048-redeem-classic-points"
	Tx2048ClaimLoginRouteName       = "2048-claim-daily-login"
	Tx2048SetUsernameRouteName      = "2048-set-username"
	DevFaucetRouteName              = "dev-faucet"
	ConfigRouteName                 = "config"
	LogsRouteName                   = "logs"
	AddVoteRouteName                = "add-vote"
	DelVoteRouteName                = "del-vote"
	SubscribeRCInfoName             = "subscribe-rc-info"
	AdminVerifyRouteName            = "admin-verify"
	AdminConfigRouteName            = "admin-config"
	AdminPoolTransferRouteName      = "admin-pool-transfer"
	AdminPoolWithdrawalRouteName    = "admin-pool-withdrawal"
	AdminPoolDepositRouteName       = "admin-pool-deposit"
	AdminBanPlayerRouteName         = "admin-ban-player"
	AdminUnbanPlayerRouteName       = "admin-unban-player"
	AdminValidatorAddressRouteName  = "admin-validator-address"
)

// routes contains the method and path for a canopy command
type routes map[string]struct {
	Method string
	Path   string
}

// routePaths is a mapping from route names to their corresponding HTTP methods and paths.
var routePaths = routes{
	VersionRouteName:                   {Method: http.MethodGet, Path: VersionRoutePath},
	TxRouteName:                        {Method: http.MethodPost, Path: TxRoutePath},
	TxsRouteName:                       {Method: http.MethodPost, Path: TxsRoutePath},
	HeightRouteName:                    {Method: http.MethodPost, Path: HeightRoutePath},
	IndexerBlobsRouteName:              {Method: http.MethodPost, Path: IndexerBlobsRoutePath},
	AccountRouteName:                   {Method: http.MethodPost, Path: AccountRoutePath},
	AccountsRouteName:                  {Method: http.MethodPost, Path: AccountsRoutePath},
	PoolRouteName:                      {Method: http.MethodPost, Path: PoolRoutePath},
	PoolsRouteName:                     {Method: http.MethodPost, Path: PoolsRoutePath},
	ValidatorRouteName:                 {Method: http.MethodPost, Path: ValidatorRoutePath},
	ValidatorsRouteName:                {Method: http.MethodPost, Path: ValidatorsRoutePath},
	CommitteeDataRouteName:             {Method: http.MethodPost, Path: CommitteeDataRoutePath},
	CommitteesDataRouteName:            {Method: http.MethodPost, Path: CommitteesDataRoutePath},
	SubsidizedCommitteesRouteName:      {Method: http.MethodPost, Path: SubsidizedCommitteesRoutePath},
	RetiredCommitteesRouteName:         {Method: http.MethodPost, Path: RetiredCommitteesRoutePath},
	NonSignersRouteName:                {Method: http.MethodPost, Path: NonSignersRoutePath},
	ParamRouteName:                     {Method: http.MethodPost, Path: ParamRoutePath},
	SupplyRouteName:                    {Method: http.MethodPost, Path: SupplyRoutePath},
	FeeParamRouteName:                  {Method: http.MethodPost, Path: FeeParamRoutePath},
	GovParamRouteName:                  {Method: http.MethodPost, Path: GovParamRoutePath},
	ConParamsRouteName:                 {Method: http.MethodPost, Path: ConParamsRoutePath},
	ValParamRouteName:                  {Method: http.MethodPost, Path: ValParamRoutePath},
	EcoParamRouteName:                  {Method: http.MethodPost, Path: EcoParamRoutePath},
	StateRouteName:                     {Method: http.MethodGet, Path: StateRoutePath},
	StateDiffRouteName:                 {Method: http.MethodPost, Path: StateDiffRoutePath},
	StateDiffGetRouteName:              {Method: http.MethodGet, Path: StateDiffGetRoutePath},
	CertByHeightRouteName:              {Method: http.MethodPost, Path: CertByHeightRoutePath},
	BlockByHeightRouteName:             {Method: http.MethodPost, Path: BlockByHeightRoutePath},
	BlocksRouteName:                    {Method: http.MethodPost, Path: BlocksRoutePath},
	BlockByHashRouteName:               {Method: http.MethodPost, Path: BlockByHashRoutePath},
	TxsByHeightRouteName:               {Method: http.MethodPost, Path: TxsByHeightRoutePath},
	TxsBySenderRouteName:               {Method: http.MethodPost, Path: TxsBySenderRoutePath},
	TxsByRecRouteName:                  {Method: http.MethodPost, Path: TxsByRecRoutePath},
	TxByHashRouteName:                  {Method: http.MethodPost, Path: TxByHashRoutePath},
	EventsByHeightRouteName:            {Method: http.MethodPost, Path: EventsByHeightRoutePath},
	EventsByAddressRouteName:           {Method: http.MethodPost, Path: EventsByAddressRoutePath},
	EventsByChainRouteName:             {Method: http.MethodPost, Path: EventsByChainRoutePath},
	OrderRouteName:                     {Method: http.MethodPost, Path: OrderRoutePath},
	OrdersRouteName:                    {Method: http.MethodPost, Path: OrdersRoutePath},
	DexPriceRouteName:                  {Method: http.MethodPost, Path: DexPriceRoutePath},
	DexBatchRouteName:                  {Method: http.MethodPost, Path: DexBatchRoutePath},
	NextDexBatchRouteName:              {Method: http.MethodPost, Path: NextDexBatchRoutePath},
	LastProposersRouteName:             {Method: http.MethodPost, Path: LastProposersRoutePath},
	IsValidDoubleSignerRouteName:       {Method: http.MethodPost, Path: IsValidDoubleSignerRoutePath},
	DoubleSignersRouteName:             {Method: http.MethodPost, Path: DoubleSignersRoutePath},
	MinimumEvidenceHeightRouteName:     {Method: http.MethodPost, Path: MinimumEvidenceHeightRoutePath},
	LotteryRouteName:                   {Method: http.MethodPost, Path: LotteryRoutePath},
	PendingRouteName:                   {Method: http.MethodPost, Path: PendingRoutePath},
	FailedTxRouteName:                  {Method: http.MethodPost, Path: FailedTxRoutePath},
	ProposalsRouteName:                 {Method: http.MethodGet, Path: ProposalsRoutePath},
	PollRouteName:                      {Method: http.MethodGet, Path: PollRoutePath},
	RootChainInfoRouteName:             {Method: http.MethodPost, Path: RootChainInfoRoutePath},
	ValidatorSetRouteName:              {Method: http.MethodPost, Path: ValidatorSetRoutePath},
	CheckpointRouteName:                {Method: http.MethodPost, Path: CheckpointRoutePath},
	Game2048ConfigRouteName:            {Method: http.MethodGet, Path: Game2048ConfigRoutePath},
	Game2048PlayerRouteName:            {Method: http.MethodPost, Path: Game2048PlayerRoutePath},
	Game2048LeaderboardsRouteName:      {Method: http.MethodGet, Path: Game2048LeaderboardsRoutePath},
	Game2048DailyPoolRouteName:         {Method: http.MethodGet, Path: Game2048DailyPoolRoutePath},
	Game2048TreasuryRouteName:          {Method: http.MethodGet, Path: Game2048TreasuryRoutePath},
	Game2048MonthlyLeaderboardRouteName: {Method: http.MethodGet, Path: Game2048MonthlyLeaderboardRoutePath},
	Game2048MonthlyPoolRouteName:       {Method: http.MethodGet, Path: Game2048MonthlyPoolRoutePath},
	Game2048ClaimableRewardsName:       {Method: http.MethodPost, Path: Game2048ClaimableRewardsPath},
	Game2048ShopConfigRouteName:        {Method: http.MethodGet, Path: Game2048ShopConfigRoutePath},
	Game2048RedeemPreviewRouteName:     {Method: http.MethodPost, Path: Game2048RedeemPreviewRoutePath},
	Game2048RedemptionsRouteName:       {Method: http.MethodPost, Path: Game2048RedemptionsRoutePath},
	Game2048GameHistoryRouteName:       {Method: http.MethodPost, Path: Game2048GameHistoryRoutePath},
	Game2048UsernameRouteName:          {Method: http.MethodPost, Path: Game2048UsernameRoutePath},
	Game2048AddressByUsernameRouteName: {Method: http.MethodPost, Path: Game2048AddressByUsernameRoutePath},
	Game2048WeeklyBlitzCurrentRouteName: {Method: http.MethodGet, Path: Game2048WeeklyBlitzCurrentRoutePath},
	Game2048WeeklyBlitzWeekRouteName:    {Method: http.MethodGet, Path: Game2048WeeklyBlitzWeekRoutePath},
	Game2048WeeklyBlitzLeaderboardRouteName: {Method: http.MethodGet, Path: Game2048WeeklyBlitzLeaderboardRoutePath},
	Game2048WeeklyBlitzPlayerStatusRouteName: {Method: http.MethodPost, Path: Game2048WeeklyBlitzPlayerStatusRoutePath},
	// eth
	EthereumRouteName: {Method: http.MethodPost, Path: EthereumRoutePath},
	// admin
	KeystoreRouteName:               {Method: http.MethodGet, Path: KeystoreRoutePath},
	KeystoreNewKeyRouteName:         {Method: http.MethodPost, Path: KeystoreNewKeyRoutePath},
	KeystoreImportRouteName:         {Method: http.MethodPost, Path: KeystoreImportRoutePath},
	KeystoreImportRawRouteName:      {Method: http.MethodPost, Path: KeystoreImportRawRoutePath},
	KeystoreDeleteRouteName:         {Method: http.MethodPost, Path: KeystoreDeleteRoutePath},
	KeystoreGetRouteName:            {Method: http.MethodPost, Path: KeystoreGetRoutePath},
	WalletVerifyRouteName:           {Method: http.MethodPost, Path: WalletVerifyRoutePath},
	TxSendRouteName:                 {Method: http.MethodPost, Path: TxSendRoutePath},
	TxSendVestingRouteName:          {Method: http.MethodPost, Path: TxSendVestingRoutePath},
	TxStakeRouteName:                {Method: http.MethodPost, Path: TxStakeRoutePath},
	TxEditOrderRouteName:            {Method: http.MethodPost, Path: TxEditOrderRoutePath},
	TxUnstakeRouteName:              {Method: http.MethodPost, Path: TxUnstakeRoutePath},
	TxPauseRouteName:                {Method: http.MethodPost, Path: TxPauseRoutePath},
	TxUnpauseRouteName:              {Method: http.MethodPost, Path: TxUnpauseRoutePath},
	TxChangeParamRouteName:          {Method: http.MethodPost, Path: TxChangeParamRoutePath},
	TxDAOTransferRouteName:          {Method: http.MethodPost, Path: TxDAOTransferRoutePath},
	TxCreateOrderRouteName:          {Method: http.MethodPost, Path: TxCreateOrderRoutePath},
	TxEditStakeRouteName:            {Method: http.MethodPost, Path: TxEditStakeRoutePath},
	TxDeleteOrderRouteName:          {Method: http.MethodPost, Path: TxDeleteOrderRoutePath},
	TxDexLimitOrderRouteName:        {Method: http.MethodPost, Path: TxDexLimitOrderPath},
	TxDexLiquidityWithdrawRouteName: {Method: http.MethodPost, Path: TxDexLiquidityWithdrawPath},
	TxDexLiquidityDepositRouteName:  {Method: http.MethodPost, Path: TxDexLiquidityDepositPath},
	TxLockOrderRouteName:            {Method: http.MethodPost, Path: TxLockOrderRoutePath},
	TxCloseOrderRouteName:           {Method: http.MethodPost, Path: TxCloseOrderRoutePath},
	TxSubsidyRouteName:              {Method: http.MethodPost, Path: TxSubsidyRoutePath},
	TxStartPollRouteName:            {Method: http.MethodPost, Path: TxStartPollRoutePath},
	TxVotePollRouteName:             {Method: http.MethodPost, Path: TxVotePollRoutePath},
	ResourceUsageRouteName:          {Method: http.MethodGet, Path: ResourceUsageRoutePath},
	PeerInfoRouteName:               {Method: http.MethodGet, Path: PeerInfoRoutePath},
	ConsensusInfoRouteName:          {Method: http.MethodGet, Path: ConsensusInfoRoutePath},
	PeerBookRouteName:               {Method: http.MethodGet, Path: PeerBookRoutePath},
	Tx2048StartDailyRouteName:       {Method: http.MethodPost, Path: Tx2048StartDailyRoutePath},
	Tx2048StartClassicRouteName:     {Method: http.MethodPost, Path: Tx2048StartClassicRoutePath},
	Tx2048StartWeeklyBlitzRouteName: {Method: http.MethodPost, Path: Tx2048StartWeeklyBlitzRoutePath},
	Tx2048SubmitRouteName:           {Method: http.MethodPost, Path: Tx2048SubmitRoutePath},
	Tx2048ClaimDailyRouteName:       {Method: http.MethodPost, Path: Tx2048ClaimDailyRoutePath},
	Tx2048RedeemClassicRouteName:    {Method: http.MethodPost, Path: Tx2048RedeemClassicRoutePath},
	Tx2048ClaimLoginRouteName:       {Method: http.MethodPost, Path: Tx2048ClaimLoginRoutePath},
	Tx2048SetUsernameRouteName:      {Method: http.MethodPost, Path: Tx2048SetUsernameRoutePath},
	DevFaucetRouteName:              {Method: http.MethodPost, Path: DevFaucetRoutePath},
	ConfigRouteName:                 {Method: http.MethodGet, Path: ConfigRoutePath},
	LogsRouteName:                   {Method: http.MethodGet, Path: LogsRoutePath},
	AddVoteRouteName:                {Method: http.MethodPost, Path: AddVoteRoutePath},
	DelVoteRouteName:                {Method: http.MethodPost, Path: DelVoteRoutePath},
	SubscribeRCInfoName:             {Method: http.MethodGet, Path: SubscribeRCInfoPath},
	AdminVerifyRouteName:            {Method: http.MethodPost, Path: AdminVerifyRoutePath},
	AdminConfigRouteName:            {Method: http.MethodGet, Path: AdminConfigRoutePath},
	AdminPoolTransferRouteName:      {Method: http.MethodPost, Path: AdminPoolTransferRoutePath},
	AdminPoolWithdrawalRouteName:    {Method: http.MethodPost, Path: AdminPoolWithdrawalRoutePath},
	AdminPoolDepositRouteName:       {Method: http.MethodPost, Path: AdminPoolDepositRoutePath},
	AdminBanPlayerRouteName:         {Method: http.MethodPost, Path: AdminBanPlayerRoutePath},
	AdminUnbanPlayerRouteName:       {Method: http.MethodPost, Path: AdminUnbanPlayerRoutePath},
	AdminValidatorAddressRouteName:  {Method: http.MethodGet, Path: AdminValidatorAddressRoutePath},
}

// httpRouteHandlers is a custom type that maps strings to httprouter handle functions
type httpRouteHandlers map[string]httprouter.Handle

// createRouter initializes and returns a new HTTP router with predefined route handlers.
func createRouter(s *Server) *httprouter.Router {
	var r = httpRouteHandlers{
		VersionRouteName:                   s.Version,
		TxRouteName:                        s.Transaction,
		TxsRouteName:                       s.Transactions,
		HeightRouteName:                    s.Height,
		IndexerBlobsRouteName:              s.IndexerBlobs,
		AccountRouteName:                   s.Account,
		AccountsRouteName:                  s.Accounts,
		PoolRouteName:                      s.Pool,
		PoolsRouteName:                     s.Pools,
		ValidatorRouteName:                 s.Validator,
		ValidatorsRouteName:                s.Validators,
		ValidatorSetRouteName:              s.ValidatorSet,
		CommitteeDataRouteName:             s.CommitteeData,
		CommitteesDataRouteName:            s.CommitteesData,
		SubsidizedCommitteesRouteName:      s.SubsidizedCommittees,
		RetiredCommitteesRouteName:         s.RetiredCommittees,
		NonSignersRouteName:                s.NonSigners,
		ParamRouteName:                     s.Params,
		FeeParamRouteName:                  s.FeeParams,
		GovParamRouteName:                  s.GovParams,
		ConParamsRouteName:                 s.ConParams,
		ValParamRouteName:                  s.ValParams,
		EcoParamRouteName:                  s.EcoParameters,
		SupplyRouteName:                    s.Supply,
		StateRouteName:                     s.State,
		StateDiffRouteName:                 s.StateDiff,
		StateDiffGetRouteName:              s.StateDiff,
		CertByHeightRouteName:              s.CertByHeight,
		BlockByHeightRouteName:             s.BlockByHeight,
		BlocksRouteName:                    s.Blocks,
		BlockByHashRouteName:               s.BlockByHash,
		TxsByHeightRouteName:               s.TransactionsByHeight,
		TxsBySenderRouteName:               s.TransactionsBySender,
		TxsByRecRouteName:                  s.TransactionsByRecipient,
		EventsByHeightRouteName:            s.EventsByHeight,
		EventsByAddressRouteName:           s.EventsByAddress,
		EventsByChainRouteName:             s.EventsByChain,
		TxByHashRouteName:                  s.TransactionByHash,
		OrderRouteName:                     s.Order,
		OrdersRouteName:                    s.Orders,
		DexPriceRouteName:                  s.DexPrice,
		DexBatchRouteName:                  s.DexBatch,
		NextDexBatchRouteName:              s.NextDexBatch,
		LastProposersRouteName:             s.LastProposers,
		IsValidDoubleSignerRouteName:       s.IsValidDoubleSigner,
		DoubleSignersRouteName:             s.DoubleSigners,
		MinimumEvidenceHeightRouteName:     s.MinimumEvidenceHeight,
		LotteryRouteName:                   s.Lottery,
		PendingRouteName:                   s.Pending,
		FailedTxRouteName:                  s.FailedTxs,
		ProposalsRouteName:                 s.Proposals,
		PollRouteName:                      s.Poll,
		RootChainInfoRouteName:             s.RootChainInfo,
		CheckpointRouteName:                s.Checkpoint,
		Game2048ConfigRouteName:            s.Game2048Config,
		Game2048PlayerRouteName:            s.Game2048Player,
		Game2048LeaderboardsRouteName:      s.Game2048Leaderboards,
		Game2048DailyPoolRouteName:         s.Game2048DailyPool,
		Game2048TreasuryRouteName:          s.Game2048Treasury,
		Game2048MonthlyLeaderboardRouteName: s.Game2048MonthlyLeaderboard,
		Game2048MonthlyPoolRouteName:       s.Game2048MonthlyPool,
		Game2048ClaimableRewardsName:       s.Game2048ClaimableRewards,
		Game2048ShopConfigRouteName:        s.Game2048ShopConfig,
		Game2048RedeemPreviewRouteName:     s.Game2048RedeemPreview,
		Game2048RedemptionsRouteName:       s.Game2048Redemptions,
		Game2048GameHistoryRouteName:       s.Game2048GameHistory,
		Game2048UsernameRouteName:          s.Game2048Username,
		Game2048AddressByUsernameRouteName: s.Game2048AddressByUsername,
		Game2048WeeklyBlitzCurrentRouteName: s.Game2048WeeklyBlitzCurrent,
		Game2048WeeklyBlitzWeekRouteName:    s.Game2048WeeklyBlitzWeek,
		Game2048WeeklyBlitzLeaderboardRouteName: s.Game2048WeeklyBlitzLeaderboard,
		Game2048WeeklyBlitzPlayerStatusRouteName: s.Game2048WeeklyBlitzPlayerStatus,
		EthereumRouteName:                  s.EthereumHandler,
		SubscribeRCInfoName:                s.WebSocket,
	}

	// Initialize a new router using the httprouter package.
	router := httprouter.New()

	for name, handler := range r {
		// Retrieve the path configuration for the current route name.
		path := routePaths[name]

		// Add the handler for the specific path and HTTP method to the router.
		router.Handle(path.Method, path.Path, logHandler{path.Path, handler}.Handle)
	}

	return router
}

// createRouter initializes and returns a new HTTP router with predefined route handlers.
func createAdminRouter(s *Server) *httprouter.Router {
	var r = httpRouteHandlers{
		KeystoreRouteName:               s.Keystore,
		KeystoreNewKeyRouteName:         s.KeystoreNewKey,
		KeystoreImportRouteName:         s.KeystoreImport,
		KeystoreImportRawRouteName:      s.KeystoreImportRaw,
		KeystoreDeleteRouteName:         s.KeystoreDelete,
		KeystoreGetRouteName:            s.KeystoreGetKeyGroup,
		WalletVerifyRouteName:           s.WalletVerify,
		TxSendRouteName:                 s.TransactionSend,
		TxSendVestingRouteName:          s.TransactionSendVesting,
		TxStakeRouteName:                s.TransactionStake,
		TxEditStakeRouteName:            s.TransactionEditStake,
		TxUnstakeRouteName:              s.TransactionUnstake,
		TxPauseRouteName:                s.TransactionPause,
		TxUnpauseRouteName:              s.TransactionUnpause,
		TxChangeParamRouteName:          s.TransactionChangeParam,
		TxDAOTransferRouteName:          s.TransactionDAOTransfer,
		TxCreateOrderRouteName:          s.TransactionCreateOrder,
		TxEditOrderRouteName:            s.TransactionEditOrder,
		TxDeleteOrderRouteName:          s.TransactionDeleteOrder,
		TxDexLimitOrderRouteName:        s.TransactionDexLimitOrder,
		TxDexLiquidityDepositRouteName:  s.TransactionDexLiquidityDeposit,
		TxDexLiquidityWithdrawRouteName: s.TransactionDexLiquidityWithdraw,
		TxLockOrderRouteName:            s.TransactionLockOrder,
		TxCloseOrderRouteName:           s.TransactionCloseOrder,
		TxSubsidyRouteName:              s.TransactionSubsidy,
		TxStartPollRouteName:            s.TransactionStartPoll,
		TxVotePollRouteName:             s.TransactionVotePoll,
		ResourceUsageRouteName:          s.ResourceUsage,
		PeerInfoRouteName:               s.PeerInfo,
		ConsensusInfoRouteName:          s.ConsensusInfo,
		PeerBookRouteName:               s.PeerBook,
		Tx2048StartDailyRouteName:       s.Game2048StartDaily,
		Tx2048StartClassicRouteName:     s.Game2048StartClassic,
		Tx2048StartWeeklyBlitzRouteName: s.Game2048StartWeeklyBlitz,
		Tx2048SubmitRouteName:           s.Game2048Submit,
		Tx2048ClaimDailyRouteName:       s.Game2048ClaimDailyReward,
		Tx2048RedeemClassicRouteName:    s.Game2048RedeemClassicPoints,
		Tx2048ClaimLoginRouteName:       s.Game2048ClaimDailyLoginReward,
		Tx2048SetUsernameRouteName:      s.Game2048SetUsername,
		DevFaucetRouteName:              s.DevFaucet,
		ConfigRouteName:                 s.Config,
		LogsRouteName:                   logsHandler(s),
		AddVoteRouteName:                s.AddVote,
		DelVoteRouteName:                s.DelVote,
		AdminVerifyRouteName:            s.AdminVerify,
		AdminConfigRouteName:            s.AdminConfig,
		AdminPoolTransferRouteName:      s.AdminPoolTransfer,
		AdminPoolWithdrawalRouteName:    s.AdminPoolWithdrawal,
		AdminPoolDepositRouteName:       s.AdminPoolDeposit,
		AdminBanPlayerRouteName:         s.AdminBanPlayer,
		AdminUnbanPlayerRouteName:       s.AdminUnbanPlayer,
		AdminValidatorAddressRouteName:  s.AdminValidatorAddress,
	}

	// Initialize a new router using the httprouter package.
	router := httprouter.New()

	for name, handler := range r {
		// Retrieve the path configuration for the current route name.
		path := routePaths[name]

		// Only wrap specific admin-only routes with authentication middleware
		// These are the routes that require admin authorization
		requiresAdminAuth := name == AdminPoolTransferRouteName ||
			name == AdminPoolWithdrawalRouteName ||
			name == AdminPoolDepositRouteName ||
			name == AdminBanPlayerRouteName ||
			name == AdminUnbanPlayerRouteName

		wrappedHandler := handler
		if requiresAdminAuth {
			wrappedHandler = s.AdminAuthMiddleware(handler)
		}

		// Add the handler for the specific path and HTTP method to the router.
		router.Handle(path.Method, path.Path, logHandler{path.Path, wrappedHandler}.Handle)
	}

	return router
}

func createDebugRouter() *httprouter.Router {
	httpRoute := func(f http.HandlerFunc) httprouter.Handle {
		return func(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
			f(w, r)
		}
	}

	router := httprouter.New()
	router.GET("/debug/pprof", httpRoute(pprof.Index))
	// importing "net/http/pprof" auto-registers all handlers on DefaultServeMux via init().
	router.GET("/debug/pprof/*name", httpRoute(http.DefaultServeMux.ServeHTTP))
	return router
}
