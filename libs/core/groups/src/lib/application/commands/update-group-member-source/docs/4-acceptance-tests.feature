Feature: Update GroupMemberSource

Scenario: Successfully updating a group source
  Given the request is valid
  And I am authorised to access the source
  And a matching record is found at the source
  When I attempt to update a group source
  Then a record should have been updated
  And saved group source is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to update a group source
  Then I should receive a RequestInvalidError

Scenario: Fail; Source not found
  Given the request is valid
  And no matching record is found at the source
  When I attempt to update a group source
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Unable to connect to source repository
Given the request is valid
  And the source repository is unavailable
  When I attempt to update a group source
  Then I should receive a RepositoryServerUnavailableError

Scenario: Fail; Unable to authenticate with source repository
Given the request is valid
  And I am NOT authorised to access the source repository
  When I attempt to update a group source
  Then I should receive a RepositoryAuthenticationError

Scenario: Fail; Problems accessing source repository
  Given the request is valid
  And I am authorised to access the source
  And I have an issue accessing the source repository
  When I attempt to update a group source
  Then I should receive a RepositoryServerError
