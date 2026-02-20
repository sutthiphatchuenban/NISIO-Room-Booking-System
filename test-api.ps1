# NISIO Room Booking System - API Test Script (PowerShell)
# Usage: .\test-api.ps1 [BASE_URL]
# Example: .\test-api.ps1 http://localhost:3000/api

param(
    [string]$BaseUrl = "http://localhost:3000/api"
)

Write-Host "Testing API at: $BaseUrl" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Store tokens and IDs
$script:AccessToken = ""
$script:RefreshToken = ""
$script:UserId = ""
$script:RoomId = ""
$script:BookingId = ""
$script:AmenityId = ""
$script:ApprovalRuleId = ""
$script:TenantId = ""
$script:Username = ""

# Helper function to make API calls
function Call-Api {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Body = "",
        [switch]$Auth
    )
    
    $Headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Auth -and $script:AccessToken) {
        $Headers["Authorization"] = "Bearer $script:AccessToken"
    }
    
    $Uri = "$BaseUrl$Endpoint"
    
    try {
        if ($Body) {
            $Response = Invoke-RestMethod -Method $Method -Uri $Uri -Headers $Headers -Body $Body -ErrorAction Stop
        } else {
            $Response = Invoke-RestMethod -Method $Method -Uri $Uri -Headers $Headers -ErrorAction Stop
        }
        return $Response
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $_.Exception.Response
    }
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Yellow
    Write-Host $Title -ForegroundColor Yellow
    Write-Host "======================================" -ForegroundColor Yellow
}

# ============================================
# 1. AUTHENTICATION TESTS
# ============================================
Write-Section "1. AUTHENTICATION TESTS"

Write-Host ""
Write-Host "1.1 Register a new user..." -ForegroundColor Green
$Timestamp = Get-Date -Format "yyyyMMddHHmmss"
$script:Username = "testuser_$Timestamp"
$RegisterBody = @{
    username = $script:Username
    password = "TestPass123!"
    name = "Test User"
} | ConvertTo-Json

$RegisterResponse = Call-Api -Method "POST" -Endpoint "/auth/register" -Body $RegisterBody
Write-Host ($RegisterResponse | ConvertTo-Json -Depth 3)

if ($RegisterResponse.success) {
    $script:UserId = $RegisterResponse.data.id
    $script:TenantId = $RegisterResponse.data.tenantId
}

Write-Host ""
Write-Host "1.2 Login..." -ForegroundColor Green
$LoginBody = @{
    username = $script:Username
    password = "TestPass123!"
    rememberMe = $true
} | ConvertTo-Json

$LoginResponse = Call-Api -Method "POST" -Endpoint "/auth/login" -Body $LoginBody
Write-Host ($LoginResponse | ConvertTo-Json -Depth 3)

if ($LoginResponse.success) {
    $script:AccessToken = $LoginResponse.data.tokens.accessToken
    $script:RefreshToken = $LoginResponse.data.tokens.refreshToken
    $script:UserId = $LoginResponse.data.user.id
    $script:TenantId = $LoginResponse.data.user.tenantId
    Write-Host "Access Token: $($script:AccessToken.Substring(0,50))..." -ForegroundColor Gray
    Write-Host "User ID: $script:UserId" -ForegroundColor Gray
    Write-Host "Tenant ID: $script:TenantId" -ForegroundColor Gray
}

Write-Host ""
Write-Host "1.3 Get current user profile..." -ForegroundColor Green
$ProfileResponse = Call-Api -Method "GET" -Endpoint "/users/me" -Auth
Write-Host ($ProfileResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "1.4 Update user profile..." -ForegroundColor Green
$UpdateProfileBody = @{
    name = "Updated Test User"
    department = "Engineering"
    phone = "+66 8123 4567"
} | ConvertTo-Json

$UpdateProfileResponse = Call-Api -Method "PATCH" -Endpoint "/users/me" -Body $UpdateProfileBody -Auth
Write-Host ($UpdateProfileResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "1.5 Refresh token..." -ForegroundColor Green
$RefreshBody = @{
    refreshToken = $script:RefreshToken
} | ConvertTo-Json

$RefreshResponse = Call-Api -Method "POST" -Endpoint "/auth/refresh" -Body $RefreshBody
Write-Host ($RefreshResponse | ConvertTo-Json -Depth 3)

# ============================================
# 2. AMENITIES TESTS
# ============================================
Write-Section "2. AMENITIES TESTS"

Write-Host ""
Write-Host "2.1 Create amenity (Admin)..." -ForegroundColor Green
$AmenityBody = @{
    name = "Projector"
    icon = "Projector"
    description = "4K HD Projector"
} | ConvertTo-Json

$AmenityResponse = Call-Api -Method "POST" -Endpoint "/amenities" -Body $AmenityBody -Auth
Write-Host ($AmenityResponse | ConvertTo-Json -Depth 3)

if ($AmenityResponse.success) {
    $script:AmenityId = $AmenityResponse.data.id
    Write-Host "Amenity ID: $script:AmenityId" -ForegroundColor Gray
}

Write-Host ""
Write-Host "2.2 Create another amenity..." -ForegroundColor Green
$Amenity2Body = @{
    name = "Whiteboard"
    icon = "Presentation"
    description = "Magnetic whiteboard"
} | ConvertTo-Json

$Amenity2Response = Call-Api -Method "POST" -Endpoint "/amenities" -Body $Amenity2Body -Auth
Write-Host ($Amenity2Response | ConvertTo-Json -Depth 3)

if ($Amenity2Response.success) {
    $Amenity2Id = $Amenity2Response.data.id
}

Write-Host ""
Write-Host "2.3 List amenities..." -ForegroundColor Green
$AmenitiesListResponse = Call-Api -Method "GET" -Endpoint "/amenities?page=1&limit=10" -Auth
Write-Host ($AmenitiesListResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "2.4 Update amenity..." -ForegroundColor Green
$UpdateAmenityBody = @{
    name = "4K Projector"
    description = "Updated description"
} | ConvertTo-Json

$UpdateAmenityResponse = Call-Api -Method "PATCH" -Endpoint "/amenities/$script:AmenityId" -Body $UpdateAmenityBody -Auth
Write-Host ($UpdateAmenityResponse | ConvertTo-Json -Depth 3)

# ============================================
# 3. ROOMS TESTS
# ============================================
Write-Section "3. ROOMS TESTS"

Write-Host ""
Write-Host "3.1 Create room (Admin)..." -ForegroundColor Green
$RoomBody = @{
    name = "Conference Room A"
    type = "meeting_room"
    description = "Large conference room with projector"
    capacity = 12
    location = "Building A, Floor 3"
    floor = 3
    amenities = @($script:AmenityId, $Amenity2Id)
    color = "#3B82F6"
    requiresApproval = $false
    minBookingDuration = 30
    maxBookingDuration = 480
    advanceBookingDays = 30
} | ConvertTo-Json

$RoomResponse = Call-Api -Method "POST" -Endpoint "/rooms" -Body $RoomBody -Auth
Write-Host ($RoomResponse | ConvertTo-Json -Depth 3)

if ($RoomResponse.success) {
    $script:RoomId = $RoomResponse.data.id
    Write-Host "Room ID: $script:RoomId" -ForegroundColor Gray
}

Write-Host ""
Write-Host "3.2 Create room requiring approval..." -ForegroundColor Green
$Room2Body = @{
    name = "Executive Suite"
    type = "meeting_room"
    description = "Premium executive meeting room"
    capacity = 8
    location = "Building A, Floor 5"
    floor = 5
    requiresApproval = $true
    minBookingDuration = 60
    maxBookingDuration = 240
    advanceBookingDays = 14
} | ConvertTo-Json

$Room2Response = Call-Api -Method "POST" -Endpoint "/rooms" -Body $Room2Body -Auth
Write-Host ($Room2Response | ConvertTo-Json -Depth 3)

if ($Room2Response.success) {
    $Room2Id = $Room2Response.data.id
}

Write-Host ""
Write-Host "3.3 List rooms..." -ForegroundColor Green
$RoomsListResponse = Call-Api -Method "GET" -Endpoint "/rooms?page=1&limit=10" -Auth
Write-Host ($RoomsListResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "3.4 Get room details..." -ForegroundColor Green
$RoomDetailResponse = Call-Api -Method "GET" -Endpoint "/rooms/$script:RoomId" -Auth
Write-Host ($RoomDetailResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "3.5 Get room availability..." -ForegroundColor Green
$Tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ssZ")
$NextWeek = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ssZ")
$AvailabilityResponse = Call-Api -Method "GET" -Endpoint "/rooms/$script:RoomId/availability?from=$Tomorrow&to=$NextWeek" -Auth
Write-Host ($AvailabilityResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "3.6 Update room..." -ForegroundColor Green
$UpdateRoomBody = @{
    capacity = 15
    description = "Updated description"
} | ConvertTo-Json

$UpdateRoomResponse = Call-Api -Method "PATCH" -Endpoint "/rooms/$script:RoomId" -Body $UpdateRoomBody -Auth
Write-Host ($UpdateRoomResponse | ConvertTo-Json -Depth 3)

# ============================================
# 4. BOOKINGS TESTS
# ============================================
Write-Section "4. BOOKINGS TESTS"

# Calculate tomorrow at 9 AM
$Tomorrow9AM = (Get-Date).AddDays(1).Date.AddHours(9).ToString("yyyy-MM-ddTHH:mm:ssZ")
$Tomorrow10AM = (Get-Date).AddDays(1).Date.AddHours(10).ToString("yyyy-MM-ddTHH:mm:ssZ")
$Tomorrow11AM = (Get-Date).AddDays(1).Date.AddHours(11).ToString("yyyy-MM-ddTHH:mm:ssZ")

Write-Host ""
Write-Host "4.1 Create booking..." -ForegroundColor Green
$BookingBody = @{
    roomId = $script:RoomId
    title = "Team Standup"
    description = "Daily team standup meeting"
    startTime = $Tomorrow9AM
    endTime = $Tomorrow10AM
} | ConvertTo-Json

$BookingResponse = Call-Api -Method "POST" -Endpoint "/bookings" -Body $BookingBody -Auth
Write-Host ($BookingResponse | ConvertTo-Json -Depth 3)

if ($BookingResponse.success) {
    $script:BookingId = $BookingResponse.data.id
    Write-Host "Booking ID: $script:BookingId" -ForegroundColor Gray
}

Write-Host ""
Write-Host "4.2 Create another booking..." -ForegroundColor Green
$Tomorrow1PM = (Get-Date).AddDays(1).Date.AddHours(13).ToString("yyyy-MM-ddTHH:mm:ssZ")
$Booking2Body = @{
    roomId = $script:RoomId
    title = "Sprint Planning"
    description = "Sprint planning session"
    startTime = $Tomorrow11AM
    endTime = $Tomorrow1PM
} | ConvertTo-Json

$Booking2Response = Call-Api -Method "POST" -Endpoint "/bookings" -Body $Booking2Body -Auth
Write-Host ($Booking2Response | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "4.3 List bookings..." -ForegroundColor Green
$BookingsListResponse = Call-Api -Method "GET" -Endpoint "/bookings?page=1&limit=10" -Auth
Write-Host ($BookingsListResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "4.4 Get my bookings..." -ForegroundColor Green
$MyBookingsResponse = Call-Api -Method "GET" -Endpoint "/bookings/my" -Auth
Write-Host ($MyBookingsResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "4.5 Get upcoming bookings..." -ForegroundColor Green
$UpcomingResponse = Call-Api -Method "GET" -Endpoint "/bookings/upcoming" -Auth
Write-Host ($UpcomingResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "4.6 Get booking details..." -ForegroundColor Green
$BookingDetailResponse = Call-Api -Method "GET" -Endpoint "/bookings/$script:BookingId" -Auth
Write-Host ($BookingDetailResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "4.7 Update booking..." -ForegroundColor Green
$UpdateBookingBody = @{
    title = "Updated Standup"
    description = "Updated description"
} | ConvertTo-Json

$UpdateBookingResponse = Call-Api -Method "PATCH" -Endpoint "/bookings/$script:BookingId" -Body $UpdateBookingBody -Auth
Write-Host ($UpdateBookingResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "4.8 Check-in to booking..." -ForegroundColor Green
$CheckInBody = @{} | ConvertTo-Json
$CheckInResponse = Call-Api -Method "POST" -Endpoint "/bookings/$script:BookingId/check-in" -Body $CheckInBody -Auth
Write-Host ($CheckInResponse | ConvertTo-Json -Depth 3)

# ============================================
# 5. AUTO APPROVAL RULES TESTS
# ============================================
Write-Section "5. AUTO APPROVAL RULES TESTS"

Write-Host ""
Write-Host "5.1 Create auto approval rule..." -ForegroundColor Green
$RuleBody = @{
    name = "Quick Bookings (< 2hrs)"
    conditions = @{
        maxDuration = 120
        maxAdvanceDays = 7
        allowedDays = @("mon", "tue", "wed", "thu", "fri")
        allowedTimeStart = "09:00"
        allowedTimeEnd = "17:00"
    }
    userExceptions = @{
        allowedRoles = @("admin", "manager")
    }
    priority = 1
} | ConvertTo-Json -Depth 5

$RuleResponse = Call-Api -Method "POST" -Endpoint "/settings/auto-approval/rules" -Body $RuleBody -Auth
Write-Host ($RuleResponse | ConvertTo-Json -Depth 3)

if ($RuleResponse.success) {
    $script:ApprovalRuleId = $RuleResponse.data.id
    Write-Host "Rule ID: $script:ApprovalRuleId" -ForegroundColor Gray
}

Write-Host ""
Write-Host "5.2 List auto approval rules..." -ForegroundColor Green
$RulesListResponse = Call-Api -Method "GET" -Endpoint "/settings/auto-approval" -Auth
Write-Host ($RulesListResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "5.3 Test auto approval rule..." -ForegroundColor Green
$TestDay = (Get-Date).AddDays(2).Date.AddHours(10).ToString("yyyy-MM-ddTHH:mm:ssZ")
$TestBody = @{
    roomId = $script:RoomId
    userId = $script:UserId
    duration = 60
    startTime = $TestDay
} | ConvertTo-Json

$TestResponse = Call-Api -Method "POST" -Endpoint "/settings/auto-approval/test" -Body $TestBody -Auth
Write-Host ($TestResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "5.4 Update approval rule..." -ForegroundColor Green
$UpdateRuleBody = @{
    name = "Updated Quick Bookings"
    priority = 2
} | ConvertTo-Json

$UpdateRuleResponse = Call-Api -Method "PATCH" -Endpoint "/settings/auto-approval/rules/$script:ApprovalRuleId" -Body $UpdateRuleBody -Auth
Write-Host ($UpdateRuleResponse | ConvertTo-Json -Depth 3)

# ============================================
# 6. DASHBOARD TESTS
# ============================================
Write-Section "6. DASHBOARD TESTS"

Write-Host ""
Write-Host "6.1 Get dashboard stats..." -ForegroundColor Green
$StatsResponse = Call-Api -Method "GET" -Endpoint "/dashboard/stats" -Auth
Write-Host ($StatsResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "6.2 Get calendar data..." -ForegroundColor Green
$CalendarResponse = Call-Api -Method "GET" -Endpoint "/dashboard/calendar?view=week" -Auth
Write-Host ($CalendarResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "6.3 Get analytics (Admin)..." -ForegroundColor Green
$AnalyticsResponse = Call-Api -Method "GET" -Endpoint "/dashboard/analytics?period=month" -Auth
Write-Host ($AnalyticsResponse | ConvertTo-Json -Depth 3)

# ============================================
# 7. USERS LIST TESTS
# ============================================
Write-Section "7. USERS LIST TESTS (Admin)"

Write-Host ""
Write-Host "7.1 List all users..." -ForegroundColor Green
$UsersListResponse = Call-Api -Method "GET" -Endpoint "/users?page=1&limit=10" -Auth
Write-Host ($UsersListResponse | ConvertTo-Json -Depth 3)

# ============================================
# 8. ADMIN APPROVAL TESTS
# ============================================
Write-Section "8. ADMIN APPROVAL TESTS"

Write-Host ""
Write-Host "8.1 Get pending approvals..." -ForegroundColor Green
$PendingResponse = Call-Api -Method "GET" -Endpoint "/approvals/pending" -Auth
Write-Host ($PendingResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "8.2 Get approval stats (Admin)..." -ForegroundColor Green
$ApprovalStatsResponse = Call-Api -Method "GET" -Endpoint "/admin/approvals/stats" -Auth
Write-Host ($ApprovalStatsResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "8.3 Get approval history (Admin)..." -ForegroundColor Green
$ApprovalHistoryResponse = Call-Api -Method "GET" -Endpoint "/admin/approvals/history?page=1&limit=10" -Auth
Write-Host ($ApprovalHistoryResponse | ConvertTo-Json -Depth 3)

# ============================================
# 9. CLEANUP TESTS
# ============================================
Write-Section "9. CLEANUP TESTS"

Write-Host ""
Write-Host "9.1 Cancel booking..." -ForegroundColor Green
$CancelBody = @{
    reason = "Test cancellation"
} | ConvertTo-Json

$CancelResponse = Call-Api -Method "DELETE" -Endpoint "/bookings/$script:BookingId" -Body $CancelBody -Auth
Write-Host ($CancelResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "9.2 Delete approval rule..." -ForegroundColor Green
$DeleteRuleResponse = Call-Api -Method "DELETE" -Endpoint "/settings/auto-approval/rules/$script:ApprovalRuleId" -Auth
Write-Host ($DeleteRuleResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "9.3 Delete amenity..." -ForegroundColor Green
$DeleteAmenityResponse = Call-Api -Method "DELETE" -Endpoint "/amenities/$script:AmenityId" -Auth
Write-Host ($DeleteAmenityResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "9.4 Delete room..." -ForegroundColor Green
$DeleteRoomResponse = Call-Api -Method "DELETE" -Endpoint "/rooms/$script:RoomId" -Auth
Write-Host ($DeleteRoomResponse | ConvertTo-Json -Depth 3)

Write-Host ""
Write-Host "9.5 Logout..." -ForegroundColor Green
$LogoutBody = @{} | ConvertTo-Json
$LogoutResponse = Call-Api -Method "POST" -Endpoint "/auth/logout" -Body $LogoutBody -Auth
Write-Host ($LogoutResponse | ConvertTo-Json -Depth 3)

# ============================================
# SUMMARY
# ============================================
Write-Section "TEST SUMMARY"
Write-Host "All API tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Created resources:"
Write-Host "  - User ID: $script:UserId"
Write-Host "  - Tenant ID: $script:TenantId"
Write-Host "  - Room ID: $script:RoomId"
Write-Host "  - Booking ID: $script:BookingId"
Write-Host "  - Amenity ID: $script:AmenityId"
Write-Host "  - Approval Rule ID: $script:ApprovalRuleId"
Write-Host ""
Write-Host "To run individual tests:"
Write-Host "  .\test-api.ps1 http://localhost:3000/api"