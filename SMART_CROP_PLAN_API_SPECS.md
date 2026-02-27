# Smart Crop Plan - API Specifications

## Base URL
```
Production: https://api.agroconnect.com/v1
Development: http://localhost:3000/api/v1
```

## Authentication
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Generate Farming Plan

### Endpoint
```
POST /farming-plans/generate
```

### Request
```json
{
  "crop_type": "Rice",
  "land_size": 2.5,
  "location": "Tiruppur"
}
```

### Response (200 OK)
```json
{
  "id": "plan_1708945800000",
  "user_id": "user_123",
  "crop_type": "Rice",
  "location": "Tiruppur",
  "land_size": 2.5,
  "suitability_score": 85,
  "climate_suitability": {
    "score": 88,
    "status": "Suitable",
    "details": []
  },
  "soil_suitability": {
    "score": 82,
    "status": "Suitable",
    "details": []
  },
  "irrigation_plan": {
    "frequency": "Daily",
    "water_amount": 50,
    "method": "Drip",
    "best_time": "Morning"
  },
  "fertilizer_plan": {
    "N": 120,
    "P": 60,
    "K": 40,
    "notes": "Nutrients balanced. Apply maintenance dose.",
    "applicationSchedule": "Apply in 3 splits: 50% at planting, 25% at tillering, 25% at flowering"
  },
  "disease_prevention_plan": [
    "Maintain field hygiene",
    "Monitor crop regularly"
  ],
  "yield_estimation": {
    "expected": 65,
    "unit": "quintals/acre",
    "confidence": 0.85,
    "potential": 65
  },
  "risk_level": "LOW",
  "risk_warnings": [],
  "smart_tips": [
    "Maintain 5cm water level during growing season",
    "Monitor for leaf blast and brown spot diseases",
    "Apply potassium at panicle initiation stage"
  ],
  "created_at": "2026-02-27T10:30:00Z",
  "updated_at": "2026-02-27T10:30:00Z"
}
```

### Error Responses

**400 Bad Request**
```json
{
  "error": "Invalid crop type",
  "message": "Supported crops: Rice, Wheat, Maize, Cotton, Tomato",
  "code": "INVALID_CROP"
}
```

**409 Conflict**
```json
{
  "error": "Plan already exists",
  "message": "Plan for Rice already generated today",
  "code": "DUPLICATE_PLAN",
  "existing_plan_id": "plan_1708945800000"
}
```

**500 Internal Server Error**
```json
{
  "error": "Plan generation failed",
  "message": "Unable to fetch climate data",
  "code": "GENERATION_FAILED"
}
```

---

## 2. Get Plan by ID

### Endpoint
```
GET /farming-plans/:plan_id
```

### Response (200 OK)
```json
{
  "id": "plan_1708945800000",
  "user_id": "user_123",
  "crop_type": "Rice",
  "location": "Tiruppur",
  "land_size": 2.5,
  "suitability_score": 85,
  "irrigation_plan": {...},
  "fertilizer_plan": {...},
  "disease_prevention_plan": [...],
  "yield_estimation": {...},
  "risk_level": "LOW",
  "risk_warnings": [],
  "smart_tips": [...],
  "created_at": "2026-02-27T10:30:00Z",
  "updated_at": "2026-02-27T10:30:00Z"
}
```

### Error Response (404 Not Found)
```json
{
  "error": "Plan not found",
  "message": "No plan with ID plan_1708945800000",
  "code": "PLAN_NOT_FOUND"
}
```

---

## 3. Get User's Plan History

### Endpoint
```
GET /farming-plans?user_id=user_123&limit=10&offset=0&crop_type=Rice&sort=-created_at
```

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| user_id | string | required | User ID |
| limit | integer | 10 | Number of plans to return |
| offset | integer | 0 | Pagination offset |
| crop_type | string | optional | Filter by crop type |
| sort | string | -created_at | Sort field (prefix - for desc) |
| start_date | string | optional | Filter from date (YYYY-MM-DD) |
| end_date | string | optional | Filter to date (YYYY-MM-DD) |

### Response (200 OK)
```json
{
  "data": [
    {
      "id": "plan_1708945800000",
      "crop_type": "Rice",
      "suitability_score": 85,
      "risk_level": "LOW",
      "yield_estimation": {
        "expected": 65,
        "unit": "quintals/acre"
      },
      "created_at": "2026-02-27T10:30:00Z"
    },
    {
      "id": "plan_1708859400000",
      "crop_type": "Wheat",
      "suitability_score": 72,
      "risk_level": "MODERATE",
      "yield_estimation": {
        "expected": 45,
        "unit": "quintals/acre"
      },
      "created_at": "2026-02-26T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "pages": 3
  }
}
```

---

## 4. Update Plan

### Endpoint
```
PUT /farming-plans/:plan_id
```

### Request
```json
{
  "land_size": 3.0,
  "smart_tips": ["Updated tip 1", "Updated tip 2"]
}
```

### Response (200 OK)
```json
{
  "id": "plan_1708945800000",
  "user_id": "user_123",
  "crop_type": "Rice",
  "land_size": 3.0,
  "suitability_score": 85,
  "smart_tips": ["Updated tip 1", "Updated tip 2"],
  "updated_at": "2026-02-27T11:00:00Z"
}
```

### Error Response (403 Forbidden)
```json
{
  "error": "Unauthorized",
  "message": "You can only update your own plans",
  "code": "UNAUTHORIZED"
}
```

---

## 5. Delete Plan

### Endpoint
```
DELETE /farming-plans/:plan_id
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Plan deleted successfully",
  "deleted_id": "plan_1708945800000"
}
```

### Error Response (404 Not Found)
```json
{
  "error": "Plan not found",
  "message": "No plan with ID plan_1708945800000",
  "code": "PLAN_NOT_FOUND"
}
```

---

## 6. Get Crop Profiles

### Endpoint
```
GET /crops/profiles
```

### Response (200 OK)
```json
{
  "crops": [
    {
      "name": "Rice",
      "temperature": {
        "min": 20,
        "max": 30,
        "optimal": 25
      },
      "rainfall": {
        "min": 150,
        "max": 250,
        "optimal": 200
      },
      "humidity": {
        "min": 60,
        "max": 90,
        "optimal": 75
      },
      "soilMoisture": {
        "min": 50,
        "max": 100,
        "optimal": 75
      },
      "pH": {
        "min": 5.5,
        "max": 7.5,
        "optimal": 6.5
      },
      "nutrients": {
        "N": 120,
        "P": 60,
        "K": 40
      },
      "waterRequirement": 50,
      "yieldPotential": 65
    }
  ]
}
```

---

## 7. Get Crop Profile by Name

### Endpoint
```
GET /crops/profiles/:crop_name
```

### Response (200 OK)
```json
{
  "name": "Rice",
  "temperature": {...},
  "rainfall": {...},
  "humidity": {...},
  "soilMoisture": {...},
  "pH": {...},
  "nutrients": {...},
  "waterRequirement": 50,
  "yieldPotential": 65
}
```

---

## 8. Recalculate Plan

### Endpoint
```
POST /farming-plans/:plan_id/recalculate
```

### Request
```json
{
  "use_latest_climate": true,
  "use_latest_soil": true
}
```

### Response (200 OK)
```json
{
  "id": "plan_1708945800000",
  "previous_suitability_score": 85,
  "new_suitability_score": 82,
  "changes": {
    "suitability_score": -3,
    "risk_level": "LOW",
    "irrigation_plan": {...},
    "fertilizer_plan": {...}
  },
  "recalculated_at": "2026-02-27T11:30:00Z"
}
```

---

## 9. Export Plan

### Endpoint
```
GET /farming-plans/:plan_id/export?format=pdf
```

### Query Parameters
| Parameter | Type | Options | Description |
|-----------|------|---------|-------------|
| format | string | pdf, csv, json | Export format |

### Response (200 OK)
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="plan_Rice_2026-02-27.pdf"

[Binary PDF content]
```

---

## 10. Get Plan Statistics

### Endpoint
```
GET /farming-plans/statistics?user_id=user_123&period=month
```

### Query Parameters
| Parameter | Type | Options | Description |
|-----------|------|---------|-------------|
| user_id | string | required | User ID |
| period | string | week, month, year | Time period |

### Response (200 OK)
```json
{
  "total_plans": 25,
  "average_suitability": 78.5,
  "risk_distribution": {
    "LOW": 15,
    "MODERATE": 8,
    "HIGH": 2
  },
  "crop_distribution": {
    "Rice": 10,
    "Wheat": 8,
    "Maize": 5,
    "Cotton": 2,
    "Tomato": 0
  },
  "average_yield_estimation": 52.3,
  "most_common_risk": "LOW",
  "most_planted_crop": "Rice"
}
```

---

## 11. Validate Plan Data

### Endpoint
```
POST /farming-plans/validate
```

### Request
```json
{
  "crop_type": "Rice",
  "land_size": 2.5,
  "climate": {
    "temperature": 28.5,
    "rainfall": 45.2,
    "humidity": 65.3
  },
  "soil": {
    "N": 85,
    "P": 45,
    "K": 35,
    "pH": 6.5,
    "moisture": 55
  }
}
```

### Response (200 OK)
```json
{
  "valid": true,
  "warnings": [],
  "errors": [],
  "suitability_preview": 85
}
```

### Error Response (400 Bad Request)
```json
{
  "valid": false,
  "warnings": [
    "Rainfall is below optimal range"
  ],
  "errors": [
    "Temperature exceeds maximum range",
    "Soil pH is too high"
  ]
}
```

---

## 12. Bulk Generate Plans

### Endpoint
```
POST /farming-plans/bulk-generate
```

### Request
```json
{
  "crops": ["Rice", "Wheat", "Maize"],
  "land_size": 2.5,
  "location": "Tiruppur"
}
```

### Response (200 OK)
```json
{
  "plans": [
    {
      "crop_type": "Rice",
      "suitability_score": 85,
      "risk_level": "LOW",
      "id": "plan_1708945800000"
    },
    {
      "crop_type": "Wheat",
      "suitability_score": 72,
      "risk_level": "MODERATE",
      "id": "plan_1708945800001"
    },
    {
      "crop_type": "Maize",
      "suitability_score": 78,
      "risk_level": "LOW",
      "id": "plan_1708945800002"
    }
  ],
  "generated_count": 3,
  "failed_count": 0
}
```

---

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_CROP | 400 | Unsupported crop type |
| INVALID_INPUT | 400 | Missing or invalid parameters |
| DUPLICATE_PLAN | 409 | Plan already exists for today |
| PLAN_NOT_FOUND | 404 | Plan ID doesn't exist |
| UNAUTHORIZED | 403 | User not authorized |
| GENERATION_FAILED | 500 | Plan generation error |
| DATABASE_ERROR | 500 | Database operation failed |
| EXTERNAL_API_ERROR | 503 | Climate/Soil API unavailable |

---

## Rate Limiting

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708945800
```

Limits:
- Generate Plan: 10 requests/hour per user
- Get History: 100 requests/hour per user
- Other endpoints: 50 requests/hour per user

---

## Pagination

All list endpoints support pagination:
```
GET /farming-plans?limit=10&offset=0
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "pages": 10
  }
}
```

---

## Sorting

Supported sort fields:
- `created_at` (default)
- `suitability_score`
- `risk_level`
- `crop_type`
- `land_size`

Usage:
```
GET /farming-plans?sort=-created_at  // Descending
GET /farming-plans?sort=suitability_score  // Ascending
```

---

## Filtering

Supported filters:
```
GET /farming-plans?crop_type=Rice&risk_level=LOW&start_date=2026-02-01&end_date=2026-02-28
```

---

## Webhooks (Future)

Subscribe to plan events:
```
POST /webhooks/subscribe
{
  "event": "plan.generated",
  "url": "https://yourapp.com/webhook"
}
```

Events:
- `plan.generated`
- `plan.updated`
- `plan.deleted`
- `plan.recalculated`

---

**API Version**: 1.0
**Last Updated**: 2026-02-27
**Status**: Ready for Implementation
