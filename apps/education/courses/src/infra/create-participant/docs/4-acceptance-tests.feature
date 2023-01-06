Feature: Create Participant

Scenario: Successfully creating a participant
  Given the request is valid
  When I attempt to create a participant
  Then a new record should have been created in the repository
  And saved participant is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a participant
  Then I should receive an InternalRequestInvalidError
  And no result is returned

Scenario: Fail; internal error occurred
  Given the request is valid
  And an internal error occurs during participant creation
  When I attempt to create a participant
  Then I should receive an error
  And no result is returned
