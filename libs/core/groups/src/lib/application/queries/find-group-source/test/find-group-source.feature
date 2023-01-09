Feature: Find Group Source

Scenario: Successfully finding a group source by Source Id
  Given the request is valid
  When I attempt to find a group source
  Then a record should have been returned

Scenario: Successfully finding a group source from non-primary source
  Given the request is valid
  When I attempt to find a group source
  Then a record should have been returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a group source
  Then I should receive a RequestInvalidError
