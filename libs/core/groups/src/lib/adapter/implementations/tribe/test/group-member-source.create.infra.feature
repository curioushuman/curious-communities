Feature: Create Group Member Source

Scenario: Successfully creating a group member source
  Given the request is valid
  When I attempt to create a group member source
  Then a new record should have been created
  And saved group member source is returned

# Should this be an internal server error?
# Scenario: Fail; Invalid request
#   Given the request contains invalid data
#   When I attempt to create a group member source
#   Then I should receive a InternalRequestInvalidError
