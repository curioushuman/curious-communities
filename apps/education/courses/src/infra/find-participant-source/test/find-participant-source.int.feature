Feature: Find Participant

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a participant source
  Then I should receive a RequestInvalidError
  And no result is returned
