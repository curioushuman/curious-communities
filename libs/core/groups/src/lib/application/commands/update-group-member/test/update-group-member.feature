Feature: Update GroupMember

Scenario: Successfully updating a group-member
  Given a matching record is found at the source
  And the returned source populates a valid group-member
  And the source does exist in our DB
  When I attempt to update a group-member
  Then the related record should have been updated in the repository
  And no result is returned

Scenario: Fail; Source not found for ID provided
  Given no record exists that matches our request
  When I attempt to update a group-member
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; GroupMember not found for ID provided
  Given a matching record is found at the source
  And the returned source populates a valid group-member
  And the source does NOT exist in our DB
  When I attempt to update a group-member
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Source does not translate into a valid GroupMember
  Given a matching record is found at the source
  And the returned source does not populate a valid GroupMember
  When I attempt to update a group-member
  Then I should receive a SourceInvalidError

Scenario: Fail; Source is an invalid status to be updated in admin
  Given a matching record is found at the source
  And the returned source has an invalid status
  When I attempt to update a group-member
  Then I should receive a SourceInvalidError

