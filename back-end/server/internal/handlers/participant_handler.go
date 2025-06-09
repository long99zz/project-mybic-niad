package handlers
import (
    "gorm.io/gorm"
    "backend/server/models"
    "github.com/gin-gonic/gin"
)
// CancerParticipantRequest dùng cho body request
type CancerParticipantRequest struct {
    FormID       uint                            `json:"form_id"`
    Participants []models.InsuranceParticipantInfo `json:"participants"`
}

// CancerParticipantResponse dùng cho response
type CancerParticipantResponse struct {
    FormID       uint                            `json:"form_id"`
    Participants []models.InsuranceParticipantInfo `json:"participants"`
}

// CreateCancerInsuranceParticipantInfo godoc
// @Summary Lưu danh sách người tham gia bảo hiểm ung thư
// @Tags Cancer
// @Accept json
// @Produce json
// @Param participant body handlers.CancerParticipantRequest true "Danh sách người tham gia"
// @Success 200 {object} handlers.CancerParticipantResponse
// @Failure 400 {object} map[string]interface{}
// @Router /api/insurance_cancer/create_insurance_participant_info [post]
func CreateCancerInsuranceParticipantInfo(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var input CancerParticipantRequest
        if err := c.ShouldBindJSON(&input); err != nil {
            c.JSON(400, gin.H{"error": "Dữ liệu không hợp lệ!"})
            return
        }
        tx := db.Begin()
        for _, p := range input.Participants {
            participant := p
            participant.FormID = &input.FormID
            if err := tx.Create(&participant).Error; err != nil {
                tx.Rollback()
                c.JSON(500, gin.H{"error": "Lỗi khi lưu người tham gia!"})
                return
            }
        }
        tx.Commit()
        c.JSON(200, CancerParticipantResponse{
            FormID:       input.FormID,
            Participants: input.Participants,
        })
    }
}