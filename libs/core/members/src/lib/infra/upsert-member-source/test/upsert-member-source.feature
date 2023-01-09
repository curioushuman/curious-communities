Feature: Upsert Member Source

Scenario: Successfully creating a member source
  Given the request is valid
  And no matching record is found at the source
  When I attempt to upsert a member source
  Then a new record should have been created
  And the created record should be returned

Scenario: Successfully updating a member source by Source Id
  Given the request is valid
  And a matching record is found at the source
  When I attempt to upsert a member source
  Then the record should have been updated
  And the updated record should be returned

Scenario: Successfully updating a member source by email
  Given the request is valid
  And a matching record is found at the source
  When I attempt to upsert a member source
  Then the record should have been updated
  And the updated record should be returned

# * This would default to create, therefore unnecessary
# Scenario: Fail; Source not found

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to upsert a member source
  Then I should receive a RequestInvalidError
