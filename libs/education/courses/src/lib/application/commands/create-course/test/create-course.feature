Feature: Create Course

Scenario: Successfully creating a course
  Given a matching record is found at the source
  And the returned source populates a valid course
  And the source does not already exist in our DB
  When I attempt to create a course
  Then a new record should have been created
  And saved course is returned

Scenario: Fail; Source not found for ID provided
  Given no record exists that matches our request
  When I attempt to create a course
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Source does not translate into a valid Course
  Given a matching record is found at the source
  And the returned source does not populate a valid Course
  When I attempt to create a course
  Then I should receive a SourceInvalidError

Scenario: Fail; Source is an invalid status to be created in admin
  Given a matching record is found at the source
  And the returned source has an invalid status
  When I attempt to create a course
  Then I should receive a SourceInvalidError

Scenario: Fail; Source already exists in our DB
  Given a matching record is found at the source
  And the returned source populates a valid course
  And the source DOES already exist in our DB
  When I attempt to create a course
  Then I should receive an RepositoryItemConflictError
