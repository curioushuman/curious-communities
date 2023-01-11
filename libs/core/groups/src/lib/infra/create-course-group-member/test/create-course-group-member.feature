Feature: Create Group

Scenario: Successfully creating a course group member
  Given the request is valid
  When I attempt to create a group member
  Then a new record should have been created
  And saved group member is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a group member
  Then I should receive a RequestInvalidError

# TODO - needs to be implemented
# Scenario: Fail; internal error occurred
#   Given the request is valid
#   And an internal error occurs during group creation
#   When I attempt to create a group
#   Then I should receive an error
