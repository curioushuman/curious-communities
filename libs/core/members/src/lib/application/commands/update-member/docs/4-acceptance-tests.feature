Feature: Update Member

Scenario: Successfully updating a member
  Given the request is valid
  And I am authorised to access the source
  And a matching record is found at the source
  And the returned source populates a valid member
  And the source does exist in our DB
  When I attempt to update a member
  Then the related record should have been updated in the repository
  And saved member is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to update a member
  Then I should receive a RequestInvalidError
  And no result is returned

Scenario: Fail; Unable to connect to source repository
Given the request is valid
  And the source repository is unavailable
  When I attempt to update a member
  Then I should receive a RepositoryServerUnavailableError
  And no result is returned

Scenario: Fail; Unable to authenticate with source repository
Given the request is valid
  And I am NOT authorised to access the source repository
  When I attempt to update a member
  Then I should receive a RepositoryAuthenticationError
  And no result is returned

Scenario: Fail; Source not found for ID provided
  Given the request is valid
  And I am authorised to access the source
  And no record exists that matches our request
  When I attempt to update a member
  Then I should receive a RepositoryItemNotFoundError
  And no result is returned

Scenario: Fail; Member not found for ID provided
  Given the request is valid
  And I am authorised to access the source
  And a matching record is found at the source
  And the returned source populates a valid member
  And the source does NOT exist in our DB
  When I attempt to update a member
  Then I should receive a RepositoryItemNotFoundError
  And no result is returned

Scenario: Fail; Problems accessing source repository
  Given the request is valid
  And I am authorised to access the source
  And I have an issue accessing the source repository
  When I attempt to update a member
  Then I should receive a RepositoryServerError
  And no result is returned

Scenario: Fail; Source does not translate into a valid Member
  Given the request is valid
  And I am authorised to access the source
  And a matching record is found at the source
  And the returned source does not populate a valid Member
  When I attempt to update a member
  Then I should receive a SourceInvalidError
  And no result is returned
