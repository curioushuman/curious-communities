Feature: Update Member

Scenario: Successfully updating a member
  Given a matching record is found at the source
  And the returned source populates a valid member
  And the source does exist in our DB
  When I attempt to update a member
  Then the related record should have been updated
  And saved member is returned

Scenario: Fail; Source not found for ID provided
  Given no record exists that matches our request
  When I attempt to update a member
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Member not found for ID provided
  Given a matching record is found at the source
  And the returned source populates a valid member
  And the source does NOT exist in our DB
  When I attempt to update a member
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Source does not translate into a valid Member
  Given a matching record is found at the source
  And the returned source does not populate a valid Member
  When I attempt to update a member
  Then I should receive a SourceInvalidError

Scenario: Fail; Source is an invalid status to be updated in admin
  Given a matching record is found at the source
  And the returned source has an invalid status
  When I attempt to update a member
  Then I should receive a SourceInvalidError

