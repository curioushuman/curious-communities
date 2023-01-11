Feature: Create Group

Scenario: Successfully updating a course group member
  Given the request is valid
  And the group member does exist in our DB
  When I attempt to update a group member
  Then a record should have been updated
  And saved group member is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to update a group member
  Then I should receive a RequestInvalidError

# TODO - needs to be implemented
# Scenario: Fail; internal error occurred
#   Given the request is valid
#   And an internal error occurs during group updation
#   When I attempt to update a group
#   Then I should receive an error
