# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - img [ref=e6]
    - generic [ref=e8]:
      - heading "Error de Aplicación" [level=2] [ref=e9]
      - paragraph [ref=e10]: Ha ocurrido un error inesperado en la aplicación.
    - alert [ref=e11]:
      - img [ref=e12]
      - generic [ref=e14]:
        - strong [ref=e15]: "Error:"
        - text: "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
    - generic [ref=e16]:
      - button "Reintentar" [ref=e17] [cursor=pointer]:
        - img [ref=e18] [cursor=pointer]
        - text: Reintentar
      - button "Ir al Login" [ref=e23] [cursor=pointer]:
        - img [ref=e24] [cursor=pointer]
        - text: Ir al Login
    - group [ref=e27]
  - region "Notifications alt+T"
  - generic:
    - generic [ref=e31] [cursor=pointer]:
      - img [ref=e32] [cursor=pointer]
      - generic [ref=e34] [cursor=pointer]: 1 error
      - button "Hide Errors" [ref=e35] [cursor=pointer]:
        - img [ref=e36] [cursor=pointer]
    - status [ref=e39]:
      - generic [ref=e40]:
        - img [ref=e42]
        - generic [ref=e44]:
          - text: Static route
          - button "Hide static indicator" [ref=e45] [cursor=pointer]:
            - img [ref=e46] [cursor=pointer]
  - alert [ref=e49]
```