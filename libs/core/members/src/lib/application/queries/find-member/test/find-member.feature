Feature: Find Member

Scenario: Successfully finding a member by Id
  Given the request is valid
  When I attempt to find a member
  Then a record should have been returned

Scenario: Successfully finding a member by Source Id
  Given the request is valid
  When I attempt to find a member
  Then a record should have been returned

Scenario: Successfully finding a member by email
  Given the request is valid
  When I attempt to find a member
  Then a record should have been returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a member
  Then I should receive a RequestInvalidError
