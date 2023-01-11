Feature: Create Group

Scenario: Successfully updating a course group member
  Given the request is valid
  And the group member does exist in our DB
  When I attempt to update a group member
  Then a record should have been updated
  And saved group member is returned

Scenario: Fail; Group member not found
  Given the request is valid
  And the group member does NOT exist in our DB
  When I attempt to update a group
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to update a group member
  Then I should receive a RequestInvalidError
