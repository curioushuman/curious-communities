Feature: Find GroupMember

# Scenario: Successfully finding a groupMember by Id
#   Given the request is valid
#   When I attempt to find a groupMember
#   Then a record should have been returned

Scenario: Successfully finding a groupMember by Source Id
  Given the request is valid
  When I attempt to find a groupMember
  Then a record should have been returned

Scenario: Successfully finding a groupMember by participant Id
  Given the request is valid
  When I attempt to find a groupMember
  Then a record should have been returned

Scenario: Fail; groupMember not found
  Given the request is valid
  And the groupMember does NOT exist in the DB
  When I attempt to find a groupMember
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a groupMember
  Then I should receive a InternalRequestInvalidError
