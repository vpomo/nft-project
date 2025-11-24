package handlers

import (
	"github.com/gofiber/fiber/v2"
	"main/internal/service"
	"main/tools/pkg/logger"
	"io"
)

// KuboHandlers
type KuboHandlers struct {
	logger *logger.Logger
}

// NewAuthHandlers конструктор для обработчиков IDM методов
func NewKuboHandlers(logger *logger.Logger) *KuboHandlers {
	return &KuboHandlers{
		logger: logger,
	}
}

// UploadFileHandler обрабатывает загрузку файла.
func UploadFileHandler(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot read file from form",
		})
	}

	// Read file into a buffer
	openedFile, err := file.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Cannot open file",
		})
	}
	defer openedFile.Close()

	buffer, err := io.ReadAll(openedFile)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Cannot read file content",
		})
	}

	addResponse, cidV1, gatewayURL, err := service.AddFileToIPFS(buffer, file.Filename)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message":    "File uploaded successfully to IPFS",
		"cid_v0":     addResponse.Hash,
		"cid_v1":     cidV1,
		"gatewayUrl": gatewayURL,
		"fileName":   addResponse.Name,
		"fileSize":   addResponse.Size,
	})
}

// PinCidHandler обрабатывает закрепление CID.
func PinCidHandler(c *fiber.Ctx) error {
	cid := c.Params("cid")
	if cid == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "CID не указан"})
	}

	pinResponse, err := service.PinCID(cid)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(pinResponse)
}

// UnpinCidHandler обрабатывает открепление CID.
func UnpinCidHandler(c *fiber.Ctx) error {
	cid := c.Params("cid")
	if cid == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "CID не указан"})
	}

	unpinResponse, err := service.UnpinCID(cid)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(unpinResponse)
}

// ListPinsHandler обрабатывает запрос на получение списка закрепленных CID.
func ListPinsHandler(c *fiber.Ctx) error {
	lsResponse, err := service.ListPinnedCIDs()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(lsResponse)
}
