//! A small, strict JSON reader, for reading floodwall's own JSON Lines back
//! (see [`crate::export`]).
//!
//! It reads standard JSON (RFC 8259) with three restrictions that floodwall's
//! output never needs, so anything outside them is refused rather than
//! guessed at: numbers must be non-negative whole numbers that fit a `u64`;
//! an object may not repeat a key (parsers disagree on which copy wins); and
//! nesting is limited to [`MAX_DEPTH`] levels, so hostile input cannot
//! exhaust the stack. Object keys keep their order. Strings may hold any
//! character, written raw or escaped, except a lone surrogate (`\ud800`),
//! which is not a character and has no UTF-8 form.

use std::fmt;

/// How deeply arrays and objects may nest. floodwall's lines need 4.
pub(crate) const MAX_DEPTH: usize = 32;

/// A parsed JSON value.
#[derive(Clone, Debug, PartialEq, Eq)]
pub(crate) enum Value {
    Null,
    Bool(bool),
    Number(u64),
    String(String),
    Array(Vec<Value>),
    /// Keys in the order they were written; no key appears twice.
    Object(Vec<(String, Value)>),
}

impl Value {
    /// A short name for the value's kind, for error messages.
    pub(crate) fn kind(&self) -> &'static str {
        match self {
            Value::Null => "null",
            Value::Bool(_) => "a boolean",
            Value::Number(_) => "a number",
            Value::String(_) => "a string",
            Value::Array(_) => "an array",
            Value::Object(_) => "an object",
        }
    }
}

/// Why some text is not JSON this reader accepts.
#[derive(Clone, Debug, PartialEq, Eq)]
pub(crate) struct JsonError {
    /// Byte offset of the problem in the text.
    pub(crate) at: usize,
    pub(crate) problem: String,
}

impl fmt::Display for JsonError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{} (at byte {})", self.problem, self.at)
    }
}

/// Parse `text` as exactly one JSON value, with optional whitespace around
/// it.
pub(crate) fn parse(text: &str) -> Result<Value, JsonError> {
    let mut p = Parser {
        bytes: text.as_bytes(),
        pos: 0,
    };
    p.whitespace();
    let value = p.value(0)?;
    p.whitespace();
    if p.pos != p.bytes.len() {
        return Err(p.error("unexpected text after the value"));
    }
    Ok(value)
}

struct Parser<'a> {
    bytes: &'a [u8],
    pos: usize,
}

impl Parser<'_> {
    fn error(&self, problem: impl Into<String>) -> JsonError {
        JsonError {
            at: self.pos,
            problem: problem.into(),
        }
    }

    fn peek(&self) -> Option<u8> {
        self.bytes.get(self.pos).copied()
    }

    fn whitespace(&mut self) {
        while matches!(self.peek(), Some(b' ' | b'\t' | b'\n' | b'\r')) {
            self.pos += 1;
        }
    }

    /// Consume `expected`, or fail saying what was wanted.
    fn expect(&mut self, expected: u8, wanted: &str) -> Result<(), JsonError> {
        if self.peek() == Some(expected) {
            self.pos += 1;
            Ok(())
        } else {
            Err(self.error(format!("expected {wanted}")))
        }
    }

    fn value(&mut self, depth: usize) -> Result<Value, JsonError> {
        match self.peek() {
            None => Err(self.error("expected a value, found the end")),
            Some(b'{') => self.object(depth),
            Some(b'[') => self.array(depth),
            Some(b'"') => self.string().map(Value::String),
            Some(b'0'..=b'9') => self.number().map(Value::Number),
            Some(b'-') => Err(self.error("negative numbers are not used")),
            Some(b'n') => self.literal("null", Value::Null),
            Some(b't') => self.literal("true", Value::Bool(true)),
            Some(b'f') => self.literal("false", Value::Bool(false)),
            Some(_) => Err(self.error("expected a value")),
        }
    }

    fn literal(&mut self, word: &str, value: Value) -> Result<Value, JsonError> {
        if self.bytes[self.pos..].starts_with(word.as_bytes()) {
            self.pos += word.len();
            Ok(value)
        } else {
            Err(self.error("expected a value"))
        }
    }

    fn nest(&self, depth: usize) -> Result<usize, JsonError> {
        if depth >= MAX_DEPTH {
            Err(self.error(format!("nested more than {MAX_DEPTH} levels deep")))
        } else {
            Ok(depth + 1)
        }
    }

    fn object(&mut self, depth: usize) -> Result<Value, JsonError> {
        let depth = self.nest(depth)?;
        self.pos += 1; // '{'
        let mut fields: Vec<(String, Value)> = Vec::new();
        self.whitespace();
        if self.peek() == Some(b'}') {
            self.pos += 1;
            return Ok(Value::Object(fields));
        }
        loop {
            self.whitespace();
            if self.peek() != Some(b'"') {
                return Err(self.error("expected a key (a string)"));
            }
            let key_at = self.pos;
            let key = self.string()?;
            if fields.iter().any(|(k, _)| *k == key) {
                return Err(JsonError {
                    at: key_at,
                    problem: format!("the key {key:?} appears twice"),
                });
            }
            self.whitespace();
            self.expect(b':', "':' after a key")?;
            self.whitespace();
            let value = self.value(depth)?;
            fields.push((key, value));
            self.whitespace();
            match self.peek() {
                Some(b',') => self.pos += 1,
                Some(b'}') => {
                    self.pos += 1;
                    return Ok(Value::Object(fields));
                }
                _ => return Err(self.error("expected ',' or '}' in an object")),
            }
        }
    }

    fn array(&mut self, depth: usize) -> Result<Value, JsonError> {
        let depth = self.nest(depth)?;
        self.pos += 1; // '['
        let mut items = Vec::new();
        self.whitespace();
        if self.peek() == Some(b']') {
            self.pos += 1;
            return Ok(Value::Array(items));
        }
        loop {
            self.whitespace();
            items.push(self.value(depth)?);
            self.whitespace();
            match self.peek() {
                Some(b',') => self.pos += 1,
                Some(b']') => {
                    self.pos += 1;
                    return Ok(Value::Array(items));
                }
                _ => return Err(self.error("expected ',' or ']' in an array")),
            }
        }
    }

    fn number(&mut self) -> Result<u64, JsonError> {
        let start = self.pos;
        let mut n: u64 = 0;
        while let Some(d @ b'0'..=b'9') = self.peek() {
            if self.pos > start && self.bytes[start] == b'0' {
                return Err(JsonError {
                    at: start,
                    problem: "a number may not start with 0".into(),
                });
            }
            n = n
                .checked_mul(10)
                .and_then(|n| n.checked_add(u64::from(d - b'0')))
                .ok_or_else(|| JsonError {
                    at: start,
                    problem: "the number does not fit in a u64".into(),
                })?;
            self.pos += 1;
        }
        if matches!(self.peek(), Some(b'.' | b'e' | b'E')) {
            return Err(self.error("only whole numbers are used"));
        }
        Ok(n)
    }

    /// Four hex digits, as a UTF-16 code unit.
    fn hex4(&mut self) -> Result<u16, JsonError> {
        let digits = self
            .bytes
            .get(self.pos..self.pos + 4)
            .filter(|d| d.iter().all(u8::is_ascii_hexdigit))
            .ok_or_else(|| self.error("expected four hex digits after \\u"))?;
        let unit = digits.iter().fold(0u16, |unit, &d| {
            let digit = char::from(d).to_digit(16).unwrap_or(0) as u16;
            (unit << 4) | digit
        });
        self.pos += 4;
        Ok(unit)
    }

    fn string(&mut self) -> Result<String, JsonError> {
        let start = self.pos;
        self.pos += 1; // '"'
        let mut out = String::new();
        loop {
            match self.peek() {
                None => {
                    return Err(JsonError {
                        at: start,
                        problem: "the string is not closed".into(),
                    })
                }
                Some(b'"') => {
                    self.pos += 1;
                    return Ok(out);
                }
                Some(b'\\') => out.push(self.escape()?),
                Some(0x00..=0x1f) => {
                    return Err(self.error("a control character must be escaped in a string"))
                }
                Some(_) => {
                    // Copy raw text up to the next quote, backslash or
                    // control character. The input is a &str and those are
                    // all ASCII, so this never splits a character. The
                    // byte here is none of them, so the run is never empty
                    // and the loop always moves on.
                    let run = self.bytes[self.pos + 1..]
                        .iter()
                        .position(|&b| b == b'"' || b == b'\\' || b < 0x20)
                        .map_or(self.bytes.len(), |n| self.pos + 1 + n);
                    let text = std::str::from_utf8(&self.bytes[self.pos..run])
                        .map_err(|_| self.error("the string is not UTF-8"))?;
                    out.push_str(text);
                    self.pos = run;
                }
            }
        }
    }

    /// One escape, from its backslash: the character it stands for. A `\u`
    /// escape of a high surrogate must be followed by one of a low
    /// surrogate, and the pair stands for one character.
    fn escape(&mut self) -> Result<char, JsonError> {
        let at = self.pos;
        let fail = |problem: &str| JsonError {
            at,
            problem: problem.into(),
        };
        self.pos += 1; // the backslash
        let simple = match self.peek() {
            Some(b'"') => Some('"'),
            Some(b'\\') => Some('\\'),
            Some(b'/') => Some('/'),
            Some(b'b') => Some('\u{8}'),
            Some(b'f') => Some('\u{c}'),
            Some(b'n') => Some('\n'),
            Some(b'r') => Some('\r'),
            Some(b't') => Some('\t'),
            Some(b'u') => None,
            _ => return Err(fail("unknown escape")),
        };
        self.pos += 1;
        if let Some(c) = simple {
            return Ok(c);
        }
        let lone = "a lone surrogate is not a character";
        let unit = self.hex4()?;
        let code = match unit {
            0xd800..=0xdbff => {
                if !self.bytes[self.pos..].starts_with(b"\\u") {
                    return Err(fail(lone));
                }
                self.pos += 2;
                let low = self.hex4()?;
                if !(0xdc00..=0xdfff).contains(&low) {
                    return Err(fail(lone));
                }
                0x10000 + ((u32::from(unit) - 0xd800) << 10) + (u32::from(low) - 0xdc00)
            }
            0xdc00..=0xdfff => return Err(fail(lone)),
            _ => u32::from(unit),
        };
        char::from_u32(code).ok_or_else(|| fail(lone))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ok(text: &str) -> Value {
        parse(text).unwrap_or_else(|e| panic!("{text:?}: {e}"))
    }

    fn err(text: &str) -> String {
        match parse(text) {
            Ok(v) => panic!("{text:?} parsed as {v:?}"),
            Err(e) => e.problem,
        }
    }

    fn s(v: &str) -> Value {
        Value::String(v.into())
    }

    #[test]
    fn values_parse() {
        assert_eq!(ok("null"), Value::Null);
        assert_eq!(ok(" true "), Value::Bool(true));
        assert_eq!(ok("false"), Value::Bool(false));
        assert_eq!(ok("0"), Value::Number(0));
        assert_eq!(ok("18446744073709551615"), Value::Number(u64::MAX));
        assert_eq!(ok("[]"), Value::Array(vec![]));
        assert_eq!(ok("{}"), Value::Object(vec![]));
        assert_eq!(
            ok("{\"b\":[1,\"x\",null],\"a\":{}}"),
            Value::Object(vec![
                (
                    "b".into(),
                    Value::Array(vec![Value::Number(1), s("x"), Value::Null])
                ),
                ("a".into(), Value::Object(vec![])),
            ])
        );
        // Whitespace is allowed between tokens.
        assert_eq!(
            ok(" { \"a\" : [ 1 , 2 ] } \n"),
            Value::Object(vec![(
                "a".into(),
                Value::Array(vec![Value::Number(1), Value::Number(2)])
            )])
        );
        assert_eq!(ok("[]").kind(), "an array");
    }

    #[test]
    fn strings_unescape() {
        assert_eq!(
            ok(r#""a\"b\\c\/d\be\ff\ng\rh\ti""#),
            s("a\"b\\c/d\u{8}e\u{c}f\ng\rh\ti")
        );
        assert_eq!(ok(r#""\u0000\u001fé ""#), s("\0\u{1f}\u{e9}\u{2028}"));
        // Raw UTF-8, and a surrogate pair in either case, for one character.
        assert_eq!(ok("\"\u{1f980}\""), s("\u{1f980}"));
        assert_eq!(ok(r#""🦀""#), s("\u{1f980}"));
        assert_eq!(ok(r#""🦀""#), s("\u{1f980}"));
        assert_eq!(ok("\"\u{7f}\u{e9}x\""), s("\u{7f}\u{e9}x"));
    }

    #[test]
    fn malformed_text_is_refused() {
        for (text, problem) in [
            ("", "expected a value, found the end"),
            ("nul", "expected a value"),
            ("nullx", "unexpected text after the value"),
            ("1 2", "unexpected text after the value"),
            ("{\"a\":1,}", "expected a key (a string)"),
            ("{\"a\" 1}", "expected ':' after a key"),
            ("{\"a\":1 \"b\":2}", "expected ',' or '}' in an object"),
            ("[1 2]", "expected ',' or ']' in an array"),
            ("[1,]", "expected a value"),
            ("{1:2}", "expected a key (a string)"),
            ("\"abc", "the string is not closed"),
            (
                "\"a\nb\"",
                "a control character must be escaped in a string",
            ),
            ("\"\t\"", "a control character must be escaped in a string"),
            (r#""\x""#, "unknown escape"),
            (r#""\"#, "unknown escape"),
            (r#""\u12""#, "expected four hex digits after \\u"),
            (r#""\u12g4""#, "expected four hex digits after \\u"),
            ("'a'", "expected a value"),
            ("NaN", "expected a value"),
        ] {
            assert_eq!(err(text), problem, "{text:?}");
        }
    }

    #[test]
    fn only_whole_unsigned_numbers_are_used() {
        assert_eq!(err("-1"), "negative numbers are not used");
        assert_eq!(err("1.0"), "only whole numbers are used");
        assert_eq!(err("1e3"), "only whole numbers are used");
        assert_eq!(err("1E3"), "only whole numbers are used");
        assert_eq!(err("01"), "a number may not start with 0");
        assert_eq!(err("00"), "a number may not start with 0");
        assert_eq!(
            err("18446744073709551616"),
            "the number does not fit in a u64"
        );
        assert_eq!(
            err("99999999999999999999"),
            "the number does not fit in a u64"
        );
    }

    #[test]
    fn duplicate_keys_are_refused() {
        let e = parse("{\"a\":1,\"b\":2,\"a\":3}").unwrap_err();
        assert_eq!(e.problem, "the key \"a\" appears twice");
        assert_eq!(e.at, 13);
        // Keys that only look alike after unescaping are the same key.
        assert_eq!(err(r#"{"a":1,"a":2}"#), "the key \"a\" appears twice");
        // The same key in different objects is fine.
        ok("[{\"a\":1},{\"a\":2}]");
    }

    #[test]
    fn lone_surrogates_are_refused() {
        for text in [
            r#""\ud800""#,
            r#""\udc00""#,
            r#""\ud800x""#,
            r#""\ud800A""#,
            r#""\ud800\ud800""#,
            r#""\udfff\ud800""#,
        ] {
            assert_eq!(err(text), "a lone surrogate is not a character", "{text}");
        }
    }

    #[test]
    fn nesting_is_limited() {
        let deep = |n: usize| "[".repeat(n) + &"]".repeat(n);
        assert!(parse(&deep(MAX_DEPTH)).is_ok());
        assert_eq!(
            err(&deep(MAX_DEPTH + 1)),
            format!("nested more than {MAX_DEPTH} levels deep")
        );
        // Far too deep fails the same way, without exhausting the stack.
        assert!(err(&deep(1_000_000)).starts_with("nested more than"));
        let objects = "{\"a\":".repeat(MAX_DEPTH + 1) + "1" + &"}".repeat(MAX_DEPTH + 1);
        assert!(err(&objects).starts_with("nested more than"));
    }

    #[test]
    fn errors_say_where() {
        let e = parse("[1, x]").unwrap_err();
        assert_eq!(e.at, 4);
        assert_eq!(e.to_string(), "expected a value (at byte 4)");
    }

    /// Mangled versions of a real line never panic, and anything that does
    /// parse is a value the reader can describe.
    #[test]
    fn arbitrary_input_never_panics() {
        let line = r#"{"type":"record","seq":3,"intent_id":"18446744073709551615","agent":"dé\"p\\loy\u0001","policies":[["a","b"]],"intent":{"action":{"kind":"scale","replicas":5}},"signature":null,"x":"é🦀"}"#;
        assert!(parse(line).is_ok());
        // Bytes that matter to the grammar, to splice in.
        const SPICE: &[u8] = b"{}[]\",:\\u0123456789ntf-.e \x01";
        let mut seed = 0x2545_f491_4f6c_dd1du64;
        let mut next = move || {
            seed ^= seed << 13;
            seed ^= seed >> 7;
            seed ^= seed << 17;
            seed
        };
        let mut parsed = 0;
        for _ in 0..20_000 {
            let mut b = line.as_bytes().to_vec();
            for _ in 0..1 + next() % 4 {
                let i = (next() % b.len() as u64) as usize;
                match next() % 4 {
                    0 => b[i] = (next() % 128) as u8,
                    1 => {
                        b.remove(i);
                    }
                    2 => b.insert(i, SPICE[(next() % SPICE.len() as u64) as usize]),
                    _ => b.truncate(i),
                }
                if b.is_empty() {
                    break;
                }
            }
            if let Ok(text) = std::str::from_utf8(&b) {
                if let Ok(v) = parse(text) {
                    let _ = v.kind();
                    parsed += 1;
                }
            }
        }
        // Some mangled lines are still JSON, so both paths are exercised.
        assert!(parsed > 100, "{parsed}");
    }
}
