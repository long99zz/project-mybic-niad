package handlers

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "backend/server/models"
    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
)

func setupTestDB(t *testing.T) *gorm.DB {
    db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
    if err != nil {
        t.Fatalf("failed to connect database: %v", err)
    }
    if err := db.AutoMigrate(&models.Invoice{}, &models.Participant{}); err != nil {
        t.Fatalf("failed to migrate: %v", err)
    }
    return db
}

func TestCreateAccidentInsuranceInvoice(t *testing.T) {
    db := setupTestDB(t)
    router := gin.Default()
    router.POST("/api/insurance_accident/create_accident", CreateAccidentInsuranceInvoice(db))

    reqBody := AccidentInvoiceRequest{
        Invoice: models.Invoice{InsuranceAmount: 1000000},
        Participants: []models.Participant{
            {FullName: "Nguyen Van A", Gender: "Male"},
        },
    }
    body, _ := json.Marshal(reqBody)
    req, _ := http.NewRequest("POST", "/api/insurance_accident/create_accident", bytes.NewBuffer(body))
    req.Header.Set("Content-Type", "application/json")

    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)

    assert.Equal(t, 200, w.Code)
    assert.Contains(t, w.Body.String(), "invoice")
    assert.Contains(t, w.Body.String(), "participants")
}