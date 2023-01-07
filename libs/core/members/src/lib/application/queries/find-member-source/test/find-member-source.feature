Feature: Find Member Source

Scenario: Successfully finding a member source by Source Id
  Given the request is valid
  When I attempt to find a member source
  Then a record should have been returned

Scenario: Successfully finding a member source by email
  Given the request is valid
  When I attempt to find a member source
  Then a record should have been returned

Scenario: Successfully finding a member source from non-primary source
  Given the request is valid
  When I attempt to find a member source
  Then a record should have been returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a member source
  Then I should receive a RequestInvalidError
