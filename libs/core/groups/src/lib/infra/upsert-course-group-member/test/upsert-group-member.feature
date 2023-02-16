Feature: Upsert CourseGroupMember

Scenario: Successfully creating a group member
  Given the request is valid
  And the group member does not exist in the repository
  When I attempt to upsert a group member
  Then a new record should have been created
  And saved group member is returned

Scenario: Successfully updating a group member
  Given the request is valid
  And the group member exists in the repository
  When I attempt to upsert a group member
  Then an existing record should have been updated in the repository
  And saved group member is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a group member
  Then I should receive a RequestInvalidError

# TODO - needs to be implemented
# Scenario: Fail; internal error occurred
#   Given the request is valid
#   And an internal error occurs during group member creation
#   When I attempt to create a group member
#   Then I should receive an error
