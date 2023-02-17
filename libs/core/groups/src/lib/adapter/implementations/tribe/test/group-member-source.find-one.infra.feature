Feature: Find One Group Member Source

Scenario: Successfully find one group member source by member id
  Given I am authorised to access the source
  And a matching record exists at the source
  When I request the source by ID
  Then a source corresponding to that ID should be returned

Scenario: Successfully find one group member source by email
  Given I am authorised to access the source
  And a matching record exists at the source
  When I request the source by email
  Then a source corresponding to that email should be returned

# Scenario: Fail; Unable to authenticate with source repository
# Handled in authenticate.feature

Scenario: Fail; Source not found for ID provided
  Given I am authorised to access the source
  And a matching record DOES NOT exist at the source
  When I request the source by ID
  Then I should receive an Error
  And no result is returned
