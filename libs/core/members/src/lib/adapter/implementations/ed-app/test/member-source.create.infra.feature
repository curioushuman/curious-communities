Feature: Create Member Source

Scenario: Successfully creating a member source
  Given the request is valid
  When I attempt to create a member source
  Then a new record should have been created
  And saved member source is returned

# Should this be an internal server error?
# Scenario: Fail; Invalid request
#   Given the request contains invalid data
#   When I attempt to create a member source
#   Then I should receive a RequestInvalidError
