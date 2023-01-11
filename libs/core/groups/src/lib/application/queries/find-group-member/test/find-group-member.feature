Feature: Find GroupMember

Scenario: Successfully finding a group by Id
  Given the request is valid
  When I attempt to find a group
  Then a record should have been returned

Scenario: Successfully finding a group by Source Id
  Given the request is valid
  When I attempt to find a group
  Then a record should have been returned

Scenario: Successfully finding a group by entity
  Given the request is valid
  When I attempt to find a group
  Then a record should have been returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a group
  Then I should receive a RequestInvalidError
