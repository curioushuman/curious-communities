Feature: Create Course

Scenario: Successfully creating a course
  Given a matching record is found at the source
  And the returned source populates a valid course
  And the source does not already exist in our DB
  When I attempt to create a course
  Then a new record should have been created
  And saved course is returned

Scenario: Fail; Source does not translate into a valid Course
  Given a matching record is found at the source
  And the returned source does not populate a valid Course
  When I attempt to create a course
  Then I should receive a SourceInvalidError
