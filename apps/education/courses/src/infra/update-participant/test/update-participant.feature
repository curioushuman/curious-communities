Feature: Update Participant

# TODO: implement this scenario
# Scenario: Successfully updating a participant
#   Given the request is valid
#   When I attempt to update a participant
#   Then a new record should have been updated in the repository
#   And saved participant is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to update a participant
  Then I should receive an InternalRequestInvalidError
  And no result is returned

# TODO: implement this scenario
# Scenario: Fail; internal error occurred
#   Given the request is valid
#   And an internal error occurs during participant updation
#   When I attempt to update a participant
#   Then I should receive an error
#   And no result is returned
