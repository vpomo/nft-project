package handlers

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"main/internal/dto"
	"main/internal/repository"
	"main/internal/service"
	httputils "main/tools/pkg/http_utils"
	"main/tools/pkg/logger"
	tvoerrors "main/tools/pkg/tvo_errors"
	"strconv"
	"main/internal/models"
)

// NftHandlers
type NftHandlers struct {
	logger             *logger.Logger
	nftDataRepository  repository.NftDataRepository
	nftImageRepository repository.NftImageRepository
}

func NewNftHandlers(logger *logger.Logger, nftRepository repository.NftDataRepository, nftImageRepository repository.NftImageRepository) *NftHandlers {
	return &NftHandlers{
		logger:             logger,
		nftDataRepository:  nftRepository,
		nftImageRepository: nftImageRepository,
	}
}

func (h *NftHandlers) CreateNftData(c *fiber.Ctx) (interface{}, error) {
	description := c.FormValue("description")
	strId := c.FormValue("id")

	// Проверяем, что ID не пустой
	if strId == "" {
		log.Error("Form value 'id' is missing")
		return nil, tvoerrors.ErrInvalidRequestData
	}

	// Шаг 2: Конвертируем ID из строки в число (int64).
	tokenId, err := strconv.ParseInt(strId, 10, 64)
	if err != nil {
		log.Error("Error parsing token id from form", "error", err)
		return nil, tvoerrors.ErrInvalidRequestData
	}
	
	// Set default description if empty
	if description == "" {
		description = "Sale Google Ads Accounts"
	}

	// Шаг 3: Теперь, когда тело запроса не "потреблено", получаем файл.
	// Эта строка теперь должна сработать.
	file, err := c.FormFile("file")
	if err != nil {
		log.Error("Error reading image file", "error", err)
		// Возвращаем более конкретную ошибку, чтобы было понятно, что файл не найден
		return nil, status.Error(codes.InvalidArgument, "file is missing or key is not 'file'")
	}

	// Read file content
	fileContent, err := file.Open()
	if err != nil {
		log.Error("Error opening image file", "error", err)
		return nil, status.Error(codes.Internal, "something went wrong") //nolint
	}
	defer fileContent.Close()

	buffer := make([]byte, file.Size)
	_, err = fileContent.Read(buffer)
	if err != nil {
		log.Error("Error reading file content", "error", err)
		return nil, status.Error(codes.Internal, "something went wrong") //nolint
	}

	ctx := httputils.CtxWithAuthToken(c)
	roleId, err := httputils.RoleIDFromToken(c, "CreateNftData", h.logger)
	if err != nil {
		return nil, tvoerrors.ErrCastClaims
	}

	if roleId != 100 {
		log.Error("Wrong user role")
		return nil, tvoerrors.ErrForbidden
	}
	isExist, err := h.nftDataRepository.TokenIdExists(ctx, tokenId)
	if err != nil {
		log.Error("Error accessing to DB", "error", err)
		return nil, status.Error(codes.Internal, "something went wrong") //nolint
	}
	if isExist {
		log.Error("Wrong token id", "error", err)
		return nil, status.Error(codes.Internal, "wrong token id (is exist)") //nolint
	}
	addResponse, cidV1, _, err := service.AddFileToIPFS(file)
	if err != nil {
		log.Error("Error creating nft data ", "error", err)
		return nil, status.Error(codes.Internal, "something went wrong") //nolint
	}

	nftData := &dto.NftData{
		TokenId:     tokenId,
		Description: description,
		CidV0:       addResponse.Hash,
		CidV1:       cidV1,
		FileName:    addResponse.Name,
		FileSize:    addResponse.Size,
	}

	err = h.nftDataRepository.CreateNftData(ctx, nftData)
	if err != nil {
		log.Error("Error creating nft data", "error", err)
		return nil, status.Error(codes.Internal, "something went wrong") //nolint
	}

	// Save image to database
	nftImage := &models.NftImage{
		NftTokenID:  tokenId,
		ImageData:   buffer,
		ContentType: file.Header.Get("Content-Type"),
	}
	err = h.nftImageRepository.Create(ctx, nftImage)
	if err != nil {
		log.Error("Error creating nft image", "error", err)
		return nil, status.Error(codes.Internal, "something went wrong") //nolint
	}

	return &dto.CreateNftDataResponse{
		Message: "NFT data created successful",
	}, nil
}

func (h *NftHandlers) ReadNft(c *fiber.Ctx) (interface{}, error) {
	strId := c.Params("id")
	if strId == "" {
		log.Error("Error reading nft id", "error")
		return nil, status.Error(codes.Internal, "something went wrong") //nolint
	}
	tokenId, err := strconv.ParseInt(strId, 10, 64)

	if err != nil {
		log.Error("Error parsing nft id", "error", err)
		return nil, status.Error(codes.Internal, "something went wrong") //nolint
	}

	ctx := c.Context()

	nft, err := h.nftDataRepository.ReadNftData(ctx, tokenId)
	if err != nil {
		log.Error("Error accessing to DB", "error", err)
		return nil, status.Error(codes.Internal, "something went wrong") //nolint
	}
	if nft.TokenId == 0 {
		log.Error("nft not found by id", "id", tokenId)
		return nil, tvoerrors.ErrNotFound
	}
	
	// Set default description if empty
	description := nft.Description
	if description == "" {
		description = "Sale Google Ads Accounts"
	}
	
	return &dto.ReadNftResponse{
		TokenId:       nft.TokenId,
		Name:          fmt.Sprintf("Sale Google Ads Accounts NFT #%d", nft.TokenId),
		Description:   description,
		CidV0:         nft.CidV0,
		CidV1:         nft.CidV1,
		Image:         fmt.Sprintf("/v1/api/nft/image/%d", nft.TokenId),
		IpfsImageLink: fmt.Sprintf(service.KuboGatewayUrlTemplate, nft.CidV1),
	}, nil
}

func (h *NftHandlers) ReadAllNft(c *fiber.Ctx) (interface{}, error) {
	strLimit := c.Params("limit")
	if strLimit == "" {
		log.Error("Error reading limit", "error")
		return nil, status.Error(codes.Internal, "something went wrong") //nolint
	}
	limit, err := strconv.ParseInt(strLimit, 10, 64)

	if err != nil {
		log.Error("Error parsing limit", "error", err)
		return nil, status.Error(codes.Internal, "something went wrong") //nolint
	}

	ctx := c.Context()

	nfts, err := h.nftDataRepository.ReadAllNftData(ctx, int(limit))
	if err != nil {
		log.Error("Error accessing to DB", "error", err)
		return nil, status.Error(codes.Internal, "something went wrong") //nolint
	}

	infos := []dto.NftInfo{}
	if len(nfts) > 0 {
		for _, nft := range nfts {
			// Set default description if empty
			description := nft.Description
			if description == "" {
				description = "Sale Google Ads Accounts"
			}
			
			infos = append(infos, dto.NftInfo{
				TokenId:       nft.TokenId,
				Name:          fmt.Sprintf("Sale Google Ads Accounts NFT #%d", nft.TokenId),
				Description:   description,
				CidV0:         nft.CidV0,
				CidV1:         nft.CidV1,
				Image:         fmt.Sprintf("/v1/api/nft/image/%d", nft.TokenId),
				IpfsImageLink: fmt.Sprintf(service.KuboGatewayUrlTemplate, nft.CidV1),
			})
		}
	}

	return &dto.ReadAllNftResponse{
		Infos: &infos,
	}, nil
}

func (h *NftHandlers) ReadNftImage(c *fiber.Ctx) error {
	strId := c.Params("id")
	if strId == "" {
		log.Error("Error reading nft id", "error")
		return status.Error(codes.Internal, "something went wrong") //nolint
	}
	tokenId, err := strconv.ParseInt(strId, 10, 64)

	if err != nil {
		log.Error("Error parsing nft id", "error", err)
		return status.Error(codes.Internal, "something went wrong") //nolint
	}

	ctx := c.Context()

	image, err := h.nftImageRepository.GetByTokenID(ctx, tokenId)
	if err != nil {
		log.Error("Error accessing to DB", "error", err)
		return status.Error(codes.Internal, "something went wrong") //nolint
	}
	if image.ID == 0 {
		log.Error("nft image not found by id", "id", tokenId)
		return tvoerrors.ErrNotFound
	}

	c.Set("Content-Type", image.ContentType)
	return c.Send(image.ImageData)
}
