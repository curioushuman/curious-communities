Feature: Create Member

Scenario: Successfully creating a member
  Given the request is valid
  And a matching record is found at the source
  When I attempt to create a member
  Then a new record should have been created in the repository
  And no result is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a member
  Then I should receive a RequestInvalidError
  And no result is returned

# TODO - needs to be implemented
# Scenario: Fail; internal error occurred
#   Given the request is valid
#   And an internal error occurs during member creation
#   When I attempt to create a member
#   Then I should receive an error
#   And no result is returned
