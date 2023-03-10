Feature: Update Course

Scenario: Successfully updating a course
  Given the request is valid
  And the record does exist in our DB
  When I attempt to update a course
  Then the related record should have been updated in the repository
  And saved course is returned

# TODO: no change

# TODO: re-implement
# Scenario: Fail; Source does not translate into a valid Course
#   Given a matching record is found at the source
#   And the returned source does not populate a valid Course
#   When I attempt to update a course
#   Then I should receive a SourceInvalidError
