Feature: Create Group Source

Scenario: Successfully creating a group source
  Given the request is valid
  When I attempt to create a group
  Then a new record should have been created
  And saved group is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a group source
  Then I should receive a RequestInvalidError

Scenario: Fail; Unable to connect to source repository
  Given the request is valid
  And the source repository is unavailable
  When I attempt to create a group
  Then I should receive a RepositoryServerUnavailableError

Scenario: Fail; Unable to authenticate with source repository
  Given the request is valid
  And I am NOT authorised to access the source repository
  When I attempt to create a group
  Then I should receive a RepositoryAuthenticationError

Scenario: Fail; Problems accessing source repository
  Given the request is valid
  And I am authorised to access the source
  And I have an issue accessing the source repository
  When I attempt to create a group
  Then I should receive a RepositoryServerError
