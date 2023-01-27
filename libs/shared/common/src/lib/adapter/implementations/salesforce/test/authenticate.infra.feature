Feature: Course Source Authentication

Scenario: Successful authentication with repository
Given the repository is live
  And I am authorised to access the source
  When I attempt attempt to authenticate
  Then I should receive a positive result

Scenario: Fail; Unable to authenticate with source repository
Given the repository is live
  And I am NOT authorised to access the source repository
  When I attempt to access the source
  Then I should receive a RepositoryAuthenticationError
  And no result is returned
