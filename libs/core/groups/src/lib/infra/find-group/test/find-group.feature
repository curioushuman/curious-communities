Feature: Find Group

Scenario: Successfully finding a group by Id
  Given the request is valid
  When I attempt to find a group
  Then a record should have been returned

Scenario: Successfully finding a group by Source Id
  Given the request is valid
  When I attempt to find a group
  Then a record should have been returned

Scenario: Successfully finding a group by slug
  Given the request is valid
  When I attempt to find a group
  Then a record should have been returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a group
  Then I should receive a RequestInvalidError
  And no result is returned

# TODO - needs to be implemented
# Scenario: Fail; internal error occurred
#   Given the request is valid
#   And an internal error occurs during group lookup
#   When I attempt to find a group
#   Then I should receive an error
#   And no result is returned
