Feature: Upsert Member Source

Scenario: Successfully creating a member source
  Given the request is valid
  And no matching record is found at the source
  When I attempt to upsert a member source
  Then a new record should have been created
  And the created record should be returned

Scenario: Successfully updatimg a member source via Source Id
  Given the request is valid
  And a matching record is found at the source
  When I attempt to upsert a member source
  Then the record should have been updated
  And the updated record should be returned

Scenario: Successfully updatimg a member source via email
  Given the request is valid
  And a matching record is found at the source
  When I attempt to upsert a member source
  Then the related record should have been updated
  And the updated record should be returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to upsert a member source
  Then I should receive a RequestInvalidError
  And no result is returned

Scenario: Fail; internal error occurred
  Given the request is valid
  And an internal error occurs during member source lookup
  When I attempt to upsert a member source
  Then I should receive an error
  And no result is returned
