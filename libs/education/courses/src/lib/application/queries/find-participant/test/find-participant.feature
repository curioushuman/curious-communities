Feature: Find Participant

# Scenario: Successfully finding a participant by Id
#   Given the request is valid
#   When I attempt to find a participant
#   Then a record should have been returned

Scenario: Successfully finding a participant by Source Id
  Given the request is valid
  When I attempt to find a participant
  Then a record should have been returned

Scenario: Fail; participant not found
  Given the request is valid
  And the participant does NOT exist in the DB
  When I attempt to find a participant
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a participant
  Then I should receive a RequestInvalidError
