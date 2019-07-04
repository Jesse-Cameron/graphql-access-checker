```graphql
{
    beans {
        name
    }
}
```

```graphql
mutation addBean($beanName: String) {
    addBean(name: $beanName) {
        name
    }
}
```