package dto

type CreateNftDataRequest struct {
	Description string `json:"description" example:"About this token"`
	//ImageFile   *multipart.FileHeader `json:"file" form:"file" example:"pic12.png"`
	Id string `json:"id" example:"1"`
}

type NftData struct {
	TokenId     int64  `json:"token_id" example:"1"`
	Description string `json:"description" example:"About this token"`
	CidV0       string `json:"cid_v0" example:"dss"`
	CidV1       string `json:"cid_v1" example:"dss"`
	FileName    string `json:"file_name" example:"pic12.png"`
	FileSize    string `json:"file_size" example:"12kb"`
}

type CreateNftDataResponse struct {
	Message string `json:"message"`
}

type NftInfo struct {
	TokenId       int64  `json:"token_id" example:"1"`
	Name          string `json:"name" example:"GOOGLE ADS ACCOUNT STORE"`
	Description   string `json:"description" example:"About this token"`
	CidV0         string `json:"cid_v0" example:"dss"`
	CidV1         string `json:"cid_v1" example:"dss"`
	Image         string `json:"image" example:"https://dsdsds"`
	IpfsImageLink string `json:"ipfs_image_link" example:"http://bafy...dweb.link/"`
}

type ReadNftResponse struct {
	TokenId       int64  `json:"token_id" example:"1"`
	Name          string `json:"name" example:"GOOGLE ADS ACCOUNT STORE"`
	Description   string `json:"description" example:"About this token"`
	CidV0         string `json:"cid_v0" example:"dss"`
	CidV1         string `json:"cid_v1" example:"dss"`
	Image         string `json:"image" example:"/v1/api/nft/image/1"`
	IpfsImageLink string `json:"ipfs_image_link" example:"http://bafy...dweb.link/"`
}

type ReadAllNftResponse struct {
	Infos *[]NftInfo `json:"infos"`
}
