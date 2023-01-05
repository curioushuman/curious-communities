Feature: Find Participant

# TODO: implement this scenario
# Scenario: Successfully finding a participant
#   Given the request is valid
#   When I attempt to find a participant
#   Then a record should have been returned from the repository

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a participant
  Then I should receive an InternalRequestInvalidError
  And no result is returned

# TODO: implement this scenario
# Scenario: Fail; internal error occurred
#   Given the request is valid
#   And an internal error occurs during participant lookup
#   When I attempt to find a participant
#   Then I should receive an error
#   And no result is returned
