Feature: Create Group

Scenario: Successfully creating a course group
  Given the request is valid
  When I attempt to create a group
  Then a new record should have been created
  And saved group is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a group
  Then I should receive a SourceInvalidError
