Feature: Update Group

Scenario: Successfully updating a course group
  Given the request is valid
  And the group does exist in our DB
  When I attempt to update a group
  Then the record should have been updated
  And saved group is returned

Scenario: Fail; Group not found for course ID provided
  Given the request is valid
  And the group does NOT exist in our DB
  When I attempt to update a group
  Then I should receive a RepositoryItemNotFoundError

  Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to update a group
  Then I should receive a RequestInvalidError

