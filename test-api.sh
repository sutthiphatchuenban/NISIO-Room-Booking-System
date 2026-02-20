#!/bin/bash

# NISIO Room Booking System - API Test Script
# Usage: ./test-api.sh [BASE_URL]
# Example: ./test-api.sh http://localhost:3000/api

BASE_URL="${1:-http://localhost:3000/api}"
echo "Testing API at: $BASE_URL"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Store tokens and IDs
ACCESS_TOKEN=""
REFRESH_TOKEN=""
USER_ID=""
ROOM_ID=""
BOOKING_ID=""
AMENITY_ID=""
APPROVAL_RULE_ID=""
TENANT_ID=""

# Helper function to print section headers
print_section() {
    echo ""
    echo "======================================"
    echo -e "${YELLOW}$1${NC}"
    echo "======================================"
}

# Helper function to make API calls
call_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth=$4
    
    if [ "$auth" = "true" ] && [ -n "$ACCESS_TOKEN" ]; then
        if [ -n "$data" ]; then
            curl -s -X "$method" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $ACCESS_TOKEN" \
                -d "$data" \
                "$BASE_URL$endpoint"
        else
            curl -s -X "$method" \
                -H "Authorization: Bearer $ACCESS_TOKEN" \
                "$BASE_URL$endpoint"
        fi
    else
        if [ -n "$data" ]; then
            curl -s -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$BASE_URL$endpoint"
        else
            curl -s -X "$method" \
                "$BASE_URL$endpoint"
        fi
    fi
}

# ============================================
# 1. AUTHENTICATION TESTS
# ============================================
print_section "1. AUTHENTICATION TESTS"

echo ""
echo "1.1 Register a new user..."
REGISTER_RESPONSE=$(call_api "POST" "/auth/register" '{
    "username": "testuser_'$(date +%s)'",
    "password": "TestPass123!",
    "name": "Test User"
}')
echo "Response: $REGISTER_RESPONSE"

# Extract user info from register response
USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
TENANT_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"tenantId":"[^"]*"' | head -1 | cut -d'"' -f4)
USERNAME=$(echo "$REGISTER_RESPONSE" | grep -o '"username":"[^"]*"' | head -1 | cut -d'"' -f4)

echo ""
echo "1.2 Login..."
LOGIN_RESPONSE=$(call_api "POST" "/auth/login" "{
    \"username\": \"$USERNAME\",
    \"password\": \"TestPass123!\",
    \"rememberMe\": true
}")
echo "Response: $LOGIN_RESPONSE"

# Extract tokens
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | head -1 | cut -d'"' -f4)
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"refreshToken":"[^"]*"' | head -1 | cut -d'"' -f4)
USER_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
TENANT_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"tenantId":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo "User ID: $USER_ID"
echo "Tenant ID: $TENANT_ID"

echo ""
echo "1.3 Get current user profile..."
call_api "GET" "/users/me" "" "true" | head -c 500

echo ""
echo ""
echo "1.4 Update user profile..."
call_api "PATCH" "/users/me" '{
    "name": "Updated Test User",
    "department": "Engineering",
    "phone": "+66 8123 4567"
}' "true" | head -c 500

echo ""
echo ""
echo "1.5 Refresh token..."
call_api "POST" "/auth/refresh" "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
}" | head -c 500

# ============================================
# 2. AMENITIES TESTS
# ============================================
print_section "2. AMENITIES TESTS"

echo ""
echo "2.1 Create amenity (Admin)..."
AMENITY_RESPONSE=$(call_api "POST" "/amenities" '{
    "name": "Projector",
    "icon": "Projector",
    "description": "4K HD Projector"
}' "true")
echo "Response: $AMENITY_RESPONSE"
AMENITY_ID=$(echo "$AMENITY_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Amenity ID: $AMENITY_ID"

echo ""
echo "2.2 Create another amenity..."
AMENITY2_RESPONSE=$(call_api "POST" "/amenities" '{
    "name": "Whiteboard",
    "icon": "Presentation",
    "description": "Magnetic whiteboard"
}' "true")
AMENITY2_ID=$(echo "$AMENITY2_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Amenity 2 ID: $AMENITY2_ID"

echo ""
echo "2.3 List amenities..."
call_api "GET" "/amenities" "" "true" | head -c 500

echo ""
echo ""
echo "2.4 Update amenity..."
call_api "PATCH" "/amenities/$AMENITY_ID" '{
    "name": "4K Projector",
    "description": "Updated description"
}' "true" | head -c 500

# ============================================
# 3. ROOMS TESTS
# ============================================
print_section "3. ROOMS TESTS"

echo ""
echo "3.1 Create room (Admin)..."
ROOM_RESPONSE=$(call_api "POST" "/rooms" "{
    \"name\": \"Conference Room A\",
    \"type\": \"meeting_room\",
    \"description\": \"Large conference room with projector\",
    \"capacity\": 12,
    \"location\": \"Building A, Floor 3\",
    \"floor\": 3,
    \"amenities\": [\"$AMENITY_ID\", \"$AMENITY2_ID\"],
    \"color\": \"#3B82F6\",
    \"requiresApproval\": false,
    \"minBookingDuration\": 30,
    \"maxBookingDuration\": 480,
    \"advanceBookingDays\": 30
}")
echo "Response: $ROOM_RESPONSE"
ROOM_ID=$(echo "$ROOM_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Room ID: $ROOM_ID"

echo ""
echo "3.2 Create room requiring approval..."
ROOM2_RESPONSE=$(call_api "POST" "/rooms" '{
    "name": "Executive Suite",
    "type": "meeting_room",
    "description": "Premium executive meeting room",
    "capacity": 8,
    "location": "Building A, Floor 5",
    "floor": 5,
    "requiresApproval": true,
    "minBookingDuration": 60,
    "maxBookingDuration": 240,
    "advanceBookingDays": 14
}' "true")
ROOM2_ID=$(echo "$ROOM2_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Room 2 ID: $ROOM2_ID"

echo ""
echo "3.3 List rooms..."
call_api "GET" "/rooms?page=1&limit=10" "" "true" | head -c 800

echo ""
echo ""
echo "3.4 Get room details..."
call_api "GET" "/rooms/$ROOM_ID" "" "true" | head -c 500

echo ""
echo ""
echo "3.5 Get room availability..."
TOMORROW=$(date -d "+1 day" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -v+1d +%Y-%m-%dT%H:%M:%SZ)
NEXT_WEEK=$(date -d "+7 days" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -v+7d +%Y-%m-%dT%H:%M:%SZ)
call_api "GET" "/rooms/$ROOM_ID/availability?from=$TOMORROW&to=$NEXT_WEEK" "" "true" | head -c 800

echo ""
echo ""
echo "3.6 Update room..."
call_api "PATCH" "/rooms/$ROOM_ID" '{
    "capacity": 15,
    "description": "Updated description"
}' "true" | head -c 500

# ============================================
# 4. BOOKINGS TESTS
# ============================================
print_section "4. BOOKINGS TESTS"

# Calculate tomorrow at 9 AM
TOMORROW_9AM=$(date -d "+1 day 09:00" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -v+1d -v9H -v0M -v0S +%Y-%m-%dT%H:%M:%SZ)
TOMORROW_10AM=$(date -d "+1 day 10:00" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -v+1d -v10H -v0M -v0S +%Y-%m-%dT%H:%M:%SZ)
TOMORROW_11AM=$(date -d "+1 day 11:00" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -v+1d -v11H -v0M -v0S +%Y-%m-%dT%H:%M:%SZ)

echo ""
echo "4.1 Create booking..."
BOOKING_RESPONSE=$(call_api "POST" "/bookings" "{
    \"roomId\": \"$ROOM_ID\",
    \"title\": \"Team Standup\",
    \"description\": \"Daily team standup meeting\",
    \"startTime\": \"$TOMORROW_9AM\",
    \"endTime\": \"$TOMORROW_10AM\"
}")
echo "Response: $BOOKING_RESPONSE"
BOOKING_ID=$(echo "$BOOKING_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Booking ID: $BOOKING_ID"

echo ""
echo "4.2 Create another booking..."
BOOKING2_RESPONSE=$(call_api "POST" "/bookings" "{
    \"roomId\": \"$ROOM_ID\",
    \"title\": \"Sprint Planning\",
    \"description\": \"Sprint planning session\",
    \"startTime\": \"$TOMORROW_11AM\",
    \"endTime\": \"$(date -d '+1 day 13:00' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -v+1d -v13H +%Y-%m-%dT%H:%M:%SZ)\"
}")
BOOKING2_ID=$(echo "$BOOKING2_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Booking 2 ID: $BOOKING2_ID"

echo ""
echo ""
echo "4.3 List bookings..."
call_api "GET" "/bookings?page=1&limit=10" "" "true" | head -c 800

echo ""
echo ""
echo "4.4 Get my bookings..."
call_api "GET" "/bookings/my" "" "true" | head -c 500

echo ""
echo ""
echo "4.5 Get upcoming bookings..."
call_api "GET" "/bookings/upcoming" "" "true" | head -c 500

echo ""
echo ""
echo "4.6 Get booking details..."
call_api "GET" "/bookings/$BOOKING_ID" "" "true" | head -c 500

echo ""
echo ""
echo "4.7 Update booking..."
call_api "PATCH" "/bookings/$BOOKING_ID" '{
    "title": "Updated Standup",
    "description": "Updated description"
}' "true" | head -c 500

echo ""
echo ""
echo "4.8 Check-in to booking..."
call_api "POST" "/bookings/$BOOKING_ID/check-in" '{}' "true" | head -c 500

# ============================================
# 5. AUTO APPROVAL RULES TESTS
# ============================================
print_section "5. AUTO APPROVAL RULES TESTS"

echo ""
echo "5.1 Create auto approval rule..."
RULE_RESPONSE=$(call_api "POST" "/settings/auto-approval/rules" '{
    "name": "Quick Bookings (< 2hrs)",
    "conditions": {
        "maxDuration": 120,
        "maxAdvanceDays": 7,
        "allowedDays": ["mon", "tue", "wed", "thu", "fri"],
        "allowedTimeStart": "09:00",
        "allowedTimeEnd": "17:00"
    },
    "userExceptions": {
        "allowedRoles": ["admin", "manager"]
    },
    "priority": 1
}' "true")
echo "Response: $RULE_RESPONSE"
APPROVAL_RULE_ID=$(echo "$RULE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Rule ID: $APPROVAL_RULE_ID"

echo ""
echo ""
echo "5.2 List auto approval rules..."
call_api "GET" "/settings/auto-approval" "" "true" | head -c 800

echo ""
echo ""
echo "5.3 Test auto approval rule..."
call_api "POST" "/settings/auto-approval/test" "{
    \"roomId\": \"$ROOM_ID\",
    \"userId\": \"$USER_ID\",
    \"duration\": 60,
    \"startTime\": \"$(date -d '+2 day 10:00' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -v+2d -v10H +%Y-%m-%dT%H:%M:%SZ)\"
}" "true" | head -c 500

echo ""
echo ""
echo "5.4 Update approval rule..."
call_api "PATCH" "/settings/auto-approval/rules/$APPROVAL_RULE_ID" '{
    "name": "Updated Quick Bookings",
    "priority": 2
}' "true" | head -c 500

# ============================================
# 6. DASHBOARD TESTS
# ============================================
print_section "6. DASHBOARD TESTS"

echo ""
echo "6.1 Get dashboard stats..."
call_api "GET" "/dashboard/stats" "" "true" | head -c 800

echo ""
echo ""
echo "6.2 Get calendar data..."
call_api "GET" "/dashboard/calendar?view=week" "" "true" | head -c 800

echo ""
echo ""
echo "6.3 Get analytics (Admin)..."
call_api "GET" "/dashboard/analytics?period=month" "" "true" | head -c 800

# ============================================
# 7. USERS LIST TESTS
# ============================================
print_section "7. USERS LIST TESTS (Admin)"

echo ""
echo "7.1 List all users..."
call_api "GET" "/users?page=1&limit=10" "" "true" | head -c 500

# ============================================
# 8. ADMIN APPROVAL TESTS
# ============================================
print_section "8. ADMIN APPROVAL TESTS"

echo ""
echo "8.1 Get pending approvals..."
call_api "GET" "/approvals/pending" "" "true" | head -c 500

echo ""
echo ""
echo "8.2 Get approval stats (Admin)..."
call_api "GET" "/admin/approvals/stats" "" "true" | head -c 500

echo ""
echo ""
echo "8.3 Get approval history (Admin)..."
call_api "GET" "/admin/approvals/history?page=1&limit=10" "" "true" | head -c 500

# ============================================
# 9. CLEANUP TESTS
# ============================================
print_section "9. CLEANUP TESTS"

echo ""
echo "9.1 Cancel booking..."
call_api "DELETE" "/bookings/$BOOKING_ID" '{
    "reason": "Test cancellation"
}' "true" | head -c 500

echo ""
echo ""
echo "9.2 Delete approval rule..."
call_api "DELETE" "/settings/auto-approval/rules/$APPROVAL_RULE_ID" "" "true" | head -c 200

echo ""
echo ""
echo "9.3 Delete amenity..."
call_api "DELETE" "/amenities/$AMENITY_ID" "" "true" | head -c 200

echo ""
echo ""
echo "9.4 Delete room..."
call_api "DELETE" "/rooms/$ROOM_ID" "" "true" | head -c 200

echo ""
echo ""
echo "9.5 Logout..."
call_api "POST" "/auth/logout" '{}' "true" | head -c 200

# ============================================
# SUMMARY
# ============================================
print_section "TEST SUMMARY"
echo -e "${GREEN}All API tests completed!${NC}"
echo ""
echo "Created resources:"
echo "  - User ID: $USER_ID"
echo "  - Tenant ID: $TENANT_ID"
echo "  - Room ID: $ROOM_ID"
echo "  - Booking ID: $BOOKING_ID"
echo "  - Amenity ID: $AMENITY_ID"
echo "  - Approval Rule ID: $APPROVAL_RULE_ID"
echo ""
echo "To run individual tests:"
echo "  ./test-api.sh http://localhost:3000/api"