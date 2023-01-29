Feature: DynamoDb Mapper

Scenario: Successful preparation of domain source ids
  Given I have an item with valid source ids
  When I prepare the domain source ids
  Then I should receive a valid list

Scenario: Fail; id is not a valid idSourceValue
  Given I have an item with invalid source ids
  When I prepare the domain source ids
  Then I should receive a SourceInvalidError

Scenario: Successful preparation of persistence source fields
  Given I have an entity with valid source fields
  When I prepare the persistence source fields
  Then I should receive a valid list
