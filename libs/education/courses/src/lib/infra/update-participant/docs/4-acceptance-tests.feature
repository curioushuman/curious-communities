Feature: Update Participant

Scenario: Successfully updating a participant
  Given the request is valid
  When I attempt to update a participant
  Then the related record should have been updated in the repository
  And no result is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to update a participant
  Then I should receive a RequestInvalidError
  And no result is returned

Scenario: Fail; internal error occurred
  Given the request is valid
  And an internal error occurs during participant update
  When I attempt to update a participant
  Then I should receive an error
  And no result is returned
