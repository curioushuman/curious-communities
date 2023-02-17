Feature: Create Group Source

Scenario: Successfully creating a group source
  Given the request is valid
  When I attempt to create a group source
  Then a new record should have been created
  And saved group source is returned

# Should this be an internal server error?
# Scenario: Fail; Invalid request
#   Given the request contains invalid data
#   When I attempt to create a group source
#   Then I should receive a InternalRequestInvalidError
