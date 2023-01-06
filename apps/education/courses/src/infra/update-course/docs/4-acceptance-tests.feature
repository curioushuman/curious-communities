Feature: Update Course

Scenario: Successfully updating a course
  Given the request is valid
  When I attempt to update a course
  Then a new record should have been updated in the repository
  And saved course is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to update a course
  Then I should receive an InternalRequestInvalidError
  And no result is returned

Scenario: Fail; internal error occurred
  Given the request is valid
  And an internal error occurs during course updation
  When I attempt to update a course
  Then I should receive an error
  And no result is returned
