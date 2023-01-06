Feature: Create Participant

Scenario: Successfully creating a participant
  Given the request is valid
  When I attempt to create a participant
  Then a new record should have been created
  And saved participant is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a participant
  Then I should receive a RequestInvalidError
