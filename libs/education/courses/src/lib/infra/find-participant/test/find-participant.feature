Feature: Find Participant

Scenario: Successfully finding a participant by Id
  Given the request is valid
  When I attempt to find a participant
  Then a record should have been returned

Scenario: Successfully finding a participant by Source Id
  Given the request is valid
  When I attempt to find a participant
  Then a record should have been returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a participant
  Then I should receive a RequestInvalidError
  And no result is returned

# TODO - needs to be implemented
# Scenario: Fail; internal error occurred
#   Given the request is valid
#   And an internal error occurs during participant lookup
#   When I attempt to find a participant
#   Then I should receive an error
#   And no result is returned
