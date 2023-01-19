Feature: Find Participant Source

Scenario: Successfully finding a participant source by Source Id
  Given the request is valid
  When I attempt to find a participant source
  Then a record should have been returned

Scenario: Fail; participant source not found
  Given the request is valid
  And the participant source does NOT exist in the DB
  When I attempt to find a participant source
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a participant source
  Then I should receive a RequestInvalidError
