Feature: Member Mapper

Scenario: Successful preparation of domain model
  Given I have a valid item
  When I prepare the domain model
  Then I should receive a valid model

# Scenario: Successful preparation of persistence keys
#   Given I have an entity with valid source ids
#   When I prepare the persistence source keys
#   Then I should receive a valid keys model

# Scenario: Successful preparation of persistence source attributes
#   Given I have an entity with valid source ids
#   When I prepare the persistence source attributes
#   Then I should receive a valid attributes model
